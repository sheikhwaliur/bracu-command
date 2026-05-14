'use client'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [gsuiteEmail, setGsuiteEmail] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetOtpSent, setResetOtpSent] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [btnHover, setBtnHover] = useState(false)

  const validateBracuId = (studentId: string) => {
    if (!/^\d{8}$/.test(studentId)) return 'Student ID must be exactly 8 digits.'
    const year = parseInt(studentId.substring(0, 2))
    if (year < 15 || year > 27) return 'Invalid year in Student ID.'
    return null
  }

  const handleSignup = useCallback(async () => {
    const idErr = validateBracuId(id)
    if (idErr) { setErr(idErr); return }
    if (!gsuiteEmail.endsWith('@g.bracu.ac.bd')) { setErr('Must use your BRACU G Suite email (@g.bracu.ac.bd)'); return }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (pw !== pw2) { setErr('Passwords do not match.'); return }
    setErr(''); setLoading(true)
    const { data: existing } = await supabase.from('users').select('student_id').eq('student_id', id).single()
    if (existing) { setErr('Student ID already registered. Please sign in.'); setLoading(false); return }
    const { data: signUpData, error: authError } = await supabase.auth.signUp({ email: gsuiteEmail, password: pw })
    if (authError) { setErr(authError.message); setLoading(false); return }
    await supabase.from('users').insert({ student_id: id, password_hash: 'supabase_auth', recovery_email: recoveryEmail || gsuiteEmail, gsuite_email: gsuiteEmail, auth_uid: signUpData?.user?.id })
    setMsg('Account created! Check your BRACU G Suite inbox and click the confirmation link to activate your account.')
    setMode('login'); setLoading(false)
  }, [id, gsuiteEmail, recoveryEmail, pw, pw2])

  const handleLogin = useCallback(async () => {
    const { allowed, waitSeconds } = checkRateLimit({ key: 'login', limitMs: 300000, maxAttempts: 10 })
    if (!allowed) { setErr(`Too many attempts. Wait ${waitSeconds}s.`); return }
    const idErr = validateBracuId(id)
    if (idErr) { setErr(idErr); return }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr(''); setLoading(true)
    const { data: user, error: userError } = await supabase.from('users').select('recovery_email, gsuite_email, password_hash').eq('student_id', id).single()
    if (userError || !user) { setErr('Student ID not found. Please sign up.'); setLoading(false); return }
    const loginEmail = user.gsuite_email || user.recovery_email
    if (loginEmail) {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: pw })
      if (authError) { setErr('Incorrect password.'); setLoading(false); return }
    }
    const res = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: id }) })
    if (res.ok) { router.push('/dashboard') } else { setErr('Session error. Please try again.') }
    setLoading(false)
  }, [id, pw])

  const sendResetOtp = useCallback(async () => {
    const idErr = validateBracuId(id)
    if (idErr) { setErr(idErr); return }
    setErr(''); setLoading(true)
    const { data: user } = await supabase.from('users').select('recovery_email, gsuite_email').eq('student_id', id).single()
    if (!user) { setErr('Student ID not found.'); setLoading(false); return }
    const resetTo = user.recovery_email || user.gsuite_email
    const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetTo, studentId: id, type: 'reset' }) })
    const data = await res.json()
    if (!res.ok) { setErr(data.error || 'Failed to send OTP.'); setLoading(false); return }
    setResetOtpSent(true)
    setMsg(`OTP sent to ${resetTo.replace(/(.{2}).*(@.*)/, '$1***$2')}`)
    setLoading(false)
  }, [id])

  const verifyResetOtp = useCallback(async () => {
    if (!resetOtp || resetOtp.length !== 6) { setErr('Enter the 6-digit OTP.'); return }
    if (newPw.length < 8) { setErr('New password must be at least 8 characters.'); return }
    setErr(''); setLoading(true)
    const { data: user } = await supabase.from('users').select('recovery_email, gsuite_email').eq('student_id', id).single()
    const resetTo = user?.recovery_email || user?.gsuite_email
    const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetTo, otp: resetOtp, studentId: id, type: 'reset' }) })
    const data = await res.json()
    if (!res.ok) { setErr(data.error || 'Invalid OTP.'); setLoading(false); return }
    const resetRes = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: id, newPassword: newPw }) })
    const resetData = await resetRes.json()
    if (!resetRes.ok) { setErr(resetData.error || 'Failed to reset password.'); setLoading(false); return }
    setMsg('Password reset! You can now sign in.')
    setMode('login'); setResetOtpSent(false); setResetOtp(''); setNewPw(''); setLoading(false)
  }, [resetOtp, newPw, id])

  const inpStyle = (name: string): React.CSSProperties => ({
    width: '100%', background: '#fffbf8', border: `1px solid ${focused === name ? '#23386b' : '#d8d0c4'}`,
    color: '#111111', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', padding: '10px 12px',
    outline: 'none', borderRadius: '3px', letterSpacing: '0.3px', transition: 'border-color .2s',
  })

  const lbl: React.CSSProperties = {
    fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#23386b', display: 'block', marginBottom: '8px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
  }

  const subBtn: React.CSSProperties = {
    width: '100%', background: btnHover ? '#1a2a52' : '#23386b', color: '#fffbf8',
    border: 'none', padding: '13px', borderRadius: '3px', fontFamily: 'DM Sans, sans-serif',
    fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
    marginTop: '8px', transition: 'all .2s', cursor: 'pointer', opacity: loading ? 0.6 : 1,
  }

  const secBtn: React.CSSProperties = {
    width: '100%', background: 'transparent', color: '#666666', border: '1px solid #d8d0c4',
    padding: '12px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', borderRadius: '3px',
    textTransform: 'uppercase', fontSize: '11px', fontWeight: 400, marginTop: '8px', transition: 'all .2s',
  }

  const tabBtn = (m: string): React.CSSProperties => ({
    flex: 1, padding: '10px',
    background: mode === m ? '#23386b' : 'transparent',
    color: mode === m ? '#fffbf8' : '#666666',
    border: `1px solid ${mode === m ? '#23386b' : '#d8d0c4'}`,
    fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
    fontFamily: 'DM Sans, sans-serif', transition: 'all .2s', cursor: 'pointer', borderRadius: '3px',
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,400;1,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; cursor: crosshair; }
        :root { --ink: #111111; --ink2: #eee8df; --paper: #fffbf8; --red: #23386b; --faded: #666666; --dim: #999999; --border: #d8d0c4; }
        html, body { height: 100%; background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: #aaa; font-size: 13px; }
        input:focus { outline: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--paper); position: relative; overflow: hidden; }
        .bg-word { position: fixed; font-family: 'Cormorant Garamond', serif; color: rgba(35,56,107,0.04); letter-spacing: 12px; pointer-events: none; user-select: none; z-index: 0; line-height: 1; }
        .login-nav { position: fixed; top: 0; left: 0; right: 0; height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; z-index: 100; background: rgba(255,251,248,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
        .login-card { position: relative; z-index: 10; width: 100%; max-width: 880px; display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); margin-top: 52px; animation: rise .7s ease both; box-shadow: 0 4px 24px rgba(35,56,107,0.06); }
        .card-left { padding: 48px 40px; border-right: 1px solid var(--border); background: #23386b; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
        .card-left::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(255,251,248,0.03) 27px, rgba(255,251,248,0.03) 28px); }
        .card-left-inner { position: relative; z-index: 1; }
        .card-right { padding: 48px 40px; background: var(--paper); overflow-y: auto; max-height: 90vh; }
        .login-foot { position: fixed; bottom: 0; left: 0; right: 0; padding: 0 40px; height: 38px; display: flex; align-items: center; justify-content: space-between; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); border-top: 1px solid var(--border); background: var(--paper); font-family: 'DM Mono', monospace; }
        @media (max-width: 680px) {
          .login-card { grid-template-columns: 1fr; margin-top: 60px; max-width: 100%; }
          .card-left { display: none; }
          .card-right { padding: 32px 24px; max-height: none; }
          .login-nav { padding: 0 20px; }
          .login-foot { padding: 0 20px; font-size: 8px; }
          .login-page { padding: 16px; align-items: flex-start; padding-top: 72px; }
        }
      `}</style>

      <div className="login-page">
        <div className="bg-word" style={{ bottom: '-40px', left: '-20px', fontSize: 'clamp(160px,24vw,340px)' }}>CMD</div>
        <div className="bg-word" style={{ top: '-20px', right: '-40px', fontSize: 'clamp(70px,10vw,140px)', letterSpacing: '6px', opacity: .5 }}>BRACU</div>

        <nav className="login-nav">
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', letterSpacing: '4px', color: '#111111', fontWeight: 700 }}>
            BRACU<span style={{ color: '#23386b' }}>/</span>CMD
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#666666', fontFamily: 'DM Mono, monospace' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#23386b', display: 'inline-block', animation: 'pulse 2.5s step-end infinite' }} />
            System Online
          </div>
        </nav>

        <div className="login-card">
          <div style={{ position: 'absolute', top: '-1px', left: '60px', right: '60px', height: '2px', background: 'linear-gradient(90deg,transparent,#23386b,transparent)', zIndex: 1 }} />

          {/* LEFT — navy bg */}
          <div className="card-left">
            <div className="card-left-inner">
              <div style={{ display: 'inline-block', fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,251,248,0.6)', border: '1px solid rgba(255,251,248,0.2)', padding: '3px 9px', marginBottom: '24px', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>
                Classified — Students Only
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px,5vw,64px)', lineHeight: 0.9, letterSpacing: '2px', color: '#fffbf8', fontWeight: 700 }}>ACADEMIC</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(18px,2.2vw,28px)', letterSpacing: '3px', color: 'rgba(255,251,248,0.5)', marginBottom: '22px' }}>COMMAND</div>
              <p style={{ fontSize: '11px', color: 'rgba(255,251,248,0.6)', lineHeight: 1.9, borderLeft: '2px solid rgba(255,251,248,0.2)', paddingLeft: '14px', marginBottom: '28px', maxWidth: '260px', fontFamily: 'DM Sans, sans-serif' }}>
                Study resources, professor intelligence, AI-powered advising, live USIS seat data — built for every BRACU student, forever.
              </p>
              {['Resource archive & past papers', 'Faculty intelligence board', 'AI engine — ask anything', 'Live USIS seat data', 'CGPA & credit tracker', 'AI resume & interview prep', 'Study groups & mentorship'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(255,251,248,0.08)', fontSize: '10px', color: 'rgba(255,251,248,0.55)', letterSpacing: '.3px', fontFamily: 'DM Sans, sans-serif' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,251,248,0.4)', flexShrink: 0 }} />{f}
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: '24px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,251,248,0.35)', lineHeight: 2, fontFamily: 'DM Mono, monospace' }}>
              BRAC University // Dhaka, Bangladesh
            </div>
          </div>

          {/* RIGHT — warm white bg */}
          <div className="card-right">
            <div style={{ display: 'flex', gap: '4px', marginBottom: '28px' }}>
              {(['login', 'signup', 'reset'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(''); setMsg(''); setResetOtpSent(false) }} style={tabBtn(m)}>
                  {m === 'login' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Reset'}
                </button>
              ))}
            </div>

            {msg && <div style={{ background: 'rgba(35,56,107,0.06)', border: '1px solid rgba(35,56,107,0.2)', color: '#23386b', padding: '10px 14px', fontSize: '11px', marginBottom: '20px', borderRadius: '3px' }}>✓ {msg}</div>}
            {err && <div style={{ background: 'rgba(180,30,30,0.05)', border: '1px solid rgba(180,30,30,0.2)', color: '#b41e1e', padding: '10px 14px', fontSize: '11px', marginBottom: '20px', borderRadius: '3px' }}>✗ {err}</div>}

            {/* LOGIN */}
            {mode === 'login' && (
              <>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: '#111111', marginBottom: '28px', lineHeight: 1.1 }}>
                  Sign in to<br />the system.
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Student ID</label>
                  <input type="text" inputMode="numeric" maxLength={8} placeholder="21301234" value={id}
                    onChange={e => setId(e.target.value)} onFocus={() => setFocused('id')} onBlur={() => setFocused(null)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inpStyle('id')} autoComplete="username" />
                  <div style={{ fontSize: '9px', color: '#999', marginTop: '5px' }}>Your 8-digit BRACU student ID</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Password</label>
                  <input type="password" placeholder="••••••••" value={pw}
                    onChange={e => setPw(e.target.value)} onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inpStyle('pw')} autoComplete="current-password" />
                </div>
                <button onClick={handleLogin} disabled={loading} style={subBtn}
                  onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                  {loading ? 'Authenticating...' : 'Authenticate →'}
                </button>
              </>
            )}

            {/* SIGNUP */}
            {mode === 'signup' && (
              <>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: '#111111', marginBottom: '28px', lineHeight: 1.1 }}>
                  Join BRACU<br />Command.
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>Student ID</label>
                  <input type="text" inputMode="numeric" maxLength={8} placeholder="21301234" value={id}
                    onChange={e => setId(e.target.value)} onFocus={() => setFocused('sid')} onBlur={() => setFocused(null)}
                    style={inpStyle('sid')} autoComplete="username" />
                  <div style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>Your 8-digit BRACU student ID</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>BRACU G Suite Email</label>
                  <input type="email" placeholder="username@g.bracu.ac.bd" value={gsuiteEmail}
                    onChange={e => setGsuiteEmail(e.target.value)} onFocus={() => setFocused('gsuite')} onBlur={() => setFocused(null)}
                    style={inpStyle('gsuite')} autoComplete="email" />
                  <div style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>Confirmation link will be sent here</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>Recovery Email <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span></label>
                  <input type="email" placeholder="your.personal@gmail.com" value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)} onFocus={() => setFocused('recovery')} onBlur={() => setFocused(null)}
                    style={inpStyle('recovery')} autoComplete="email" />
                  <div style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>Used to reset password if you lose G Suite access</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>Password</label>
                  <input type="password" placeholder="Min 8 characters" value={pw}
                    onChange={e => setPw(e.target.value)} onFocus={() => setFocused('spw')} onBlur={() => setFocused(null)}
                    style={inpStyle('spw')} autoComplete="new-password" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Confirm Password</label>
                  <input type="password" placeholder="Repeat password" value={pw2}
                    onChange={e => setPw2(e.target.value)} onFocus={() => setFocused('spw2')} onBlur={() => setFocused(null)}
                    style={inpStyle('spw2')} autoComplete="new-password" />
                </div>
                <button onClick={handleSignup} disabled={loading} style={subBtn}
                  onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                  {loading ? 'Creating Account...' : 'Create Account →'}
                </button>
              </>
            )}

            {/* RESET */}
            {mode === 'reset' && (
              <>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: '#111111', marginBottom: '28px', lineHeight: 1.1 }}>
                  Recover<br />your access.
                </div>
                {!resetOtpSent ? (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={lbl}>Student ID</label>
                      <input type="text" inputMode="numeric" maxLength={8} placeholder="21301234" value={id}
                        onChange={e => setId(e.target.value)} onFocus={() => setFocused('fid')} onBlur={() => setFocused(null)}
                        style={inpStyle('fid')} autoComplete="username" />
                      <div style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>OTP sent to your recovery email</div>
                    </div>
                    <button onClick={sendResetOtp} disabled={loading} style={subBtn}
                      onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                      {loading ? 'Sending OTP...' : 'Send Reset OTP →'}
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'rgba(35,56,107,0.06)', border: '1px solid rgba(35,56,107,0.15)', padding: '12px 14px', marginBottom: '20px', fontSize: '10px', color: '#666', borderRadius: '3px' }}>
                      OTP sent to your recovery email.
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={lbl}>6-Digit OTP</label>
                      <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={resetOtp}
                        onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))} onFocus={() => setFocused('rotp')} onBlur={() => setFocused(null)}
                        style={{ ...inpStyle('rotp'), fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={lbl}>New Password</label>
                      <input type="password" placeholder="Min 8 characters" value={newPw}
                        onChange={e => setNewPw(e.target.value)} onFocus={() => setFocused('npw')} onBlur={() => setFocused(null)}
                        style={inpStyle('npw')} autoComplete="new-password" />
                    </div>
                    <button onClick={verifyResetOtp} disabled={loading} style={subBtn}
                      onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                      {loading ? 'Resetting...' : 'Reset Password →'}
                    </button>
                    <button onClick={() => { setResetOtpSent(false); setResetOtp(''); setMsg('') }} style={secBtn}>← Back</button>
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #eee8df', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 14px', fontSize: '9px', color: '#999', lineHeight: 2, fontFamily: 'DM Mono, monospace' }}>
              <div><span style={{ color: '#23386b' }}>✓</span> G Suite verified</div>
              <div><span style={{ color: '#23386b' }}>✓</span> AES-256</div>
              <div><span style={{ color: '#23386b' }}>✓</span> OTP protected</div>
              <div><span style={{ color: '#23386b' }}>✓</span> Recovery email</div>
            </div>
          </div>
        </div>

        <div className="login-foot">
          <div>BRACU/CMD — v2.0</div>
          <div>Built by a CSE student · For every student that follows</div>
        </div>
      </div>
    </>
  )
}