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

  // ── SIGNUP ──
  const handleSignup = useCallback(async () => {
    const idErr = validateBracuId(id)
    if (idErr) { setErr(idErr); return }
    if (!gsuiteEmail.endsWith('@g.bracu.ac.bd')) {
      setErr('Must use your BRACU G Suite email (@g.bracu.ac.bd)'); return
    }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (pw !== pw2) { setErr('Passwords do not match.'); return }
    setErr(''); setLoading(true)

    const { data: existing } = await supabase.from('users').select('student_id').eq('student_id', id).single()
    if (existing) { setErr('Student ID already registered. Please sign in.'); setLoading(false); return }

    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: gsuiteEmail,
      password: pw,
    })
    if (authError) { setErr(authError.message); setLoading(false); return }

    await supabase.from('users').insert({
      student_id: id,
      password_hash: 'supabase_auth',
      recovery_email: recoveryEmail || gsuiteEmail,
      gsuite_email: gsuiteEmail,
      auth_uid: signUpData?.user?.id,
    })

    setMsg('Account created! Check your BRACU G Suite inbox and click the confirmation link to activate your account.')
    setMode('login')
    setLoading(false)
  }, [id, gsuiteEmail, recoveryEmail, pw, pw2])

  // ── LOGIN ──
  const handleLogin = useCallback(async () => {
    const { allowed, waitSeconds } = checkRateLimit({ key: 'login', limitMs: 300000, maxAttempts: 10 })
    if (!allowed) { setErr(`Too many attempts. Wait ${waitSeconds}s.`); return }
    const idErr = validateBracuId(id)
    if (idErr) { setErr(idErr); return }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr(''); setLoading(true)

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('recovery_email, gsuite_email, password_hash')
      .eq('student_id', id)
      .single()

    if (userError || !user) {
      setErr('Student ID not found. Please sign up.')
      setLoading(false)
      return
    }

    const loginEmail = user.gsuite_email || user.recovery_email
    if (loginEmail) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: pw,
      })
      if (authError) { setErr('Incorrect password.'); setLoading(false); return }
    }

    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id }),
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      setErr('Session error. Please try again.')
    }
    setLoading(false)
  }, [id, pw])

  // ── SEND RESET OTP ──
  const sendResetOtp = useCallback(async () => {
    const idErr = validateBracuId(id)
    if (idErr) { setErr(idErr); return }
    setErr(''); setLoading(true)

    const { data: user } = await supabase
      .from('users')
      .select('recovery_email, gsuite_email')
      .eq('student_id', id)
      .single()

    if (!user) { setErr('Student ID not found.'); setLoading(false); return }

    const resetTo = user.recovery_email || user.gsuite_email
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTo, studentId: id, type: 'reset' }),
    })
    const data = await res.json()
    if (!res.ok) { setErr(data.error || 'Failed to send OTP.'); setLoading(false); return }

    setResetOtpSent(true)
    const maskedEmail = resetTo.replace(/(.{2}).*(@.*)/, '$1***$2')
    setMsg(`OTP sent to ${maskedEmail}`)
    setLoading(false)
  }, [id])

  // ── VERIFY RESET OTP ──
  const verifyResetOtp = useCallback(async () => {
    if (!resetOtp || resetOtp.length !== 6) { setErr('Enter the 6-digit OTP.'); return }
    if (newPw.length < 8) { setErr('New password must be at least 8 characters.'); return }
    setErr(''); setLoading(true)

    const { data: user } = await supabase
      .from('users')
      .select('recovery_email, gsuite_email')
      .eq('student_id', id)
      .single()

    const resetTo = user?.recovery_email || user?.gsuite_email

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetTo, otp: resetOtp, studentId: id, type: 'reset' }),
    })
    const data = await res.json()
    if (!res.ok) { setErr(data.error || 'Invalid OTP.'); setLoading(false); return }

    const resetRes = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id, newPassword: newPw }),
    })
    const resetData = await resetRes.json()
    if (!resetRes.ok) { setErr(resetData.error || 'Failed to reset password.'); setLoading(false); return }

    setMsg('Password reset! You can now sign in.')
    setMode('login')
    setResetOtpSent(false)
    setResetOtp('')
    setNewPw('')
    setLoading(false)
  }, [resetOtp, newPw, id])

  const inpStyle = (name: string): React.CSSProperties => ({
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `1px solid ${focused === name ? 'var(--red)' : 'rgba(242,237,228,0.15)'}`,
    color: 'var(--paper)', fontFamily: 'IBM Plex Mono, monospace',
    fontSize: '16px', padding: '10px 0', outline: 'none',
    letterSpacing: '2px', transition: 'border-color .2s', WebkitAppearance: 'none',
  })

  const lbl: React.CSSProperties = {
    fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase',
    color: 'var(--faded)', display: 'block', marginBottom: '8px', fontWeight: 700,
  }

  const subBtn: React.CSSProperties = {
    width: '100%', background: btnHover ? 'var(--red)' : 'var(--paper)',
    color: btnHover ? 'var(--paper)' : 'var(--ink)', border: 'none', padding: '16px',
    fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', letterSpacing: '3px',
    textTransform: 'uppercase', fontWeight: 700, marginTop: '8px',
    transition: 'all .2s', cursor: 'crosshair', opacity: loading ? 0.6 : 1,
  }

  const secBtn: React.CSSProperties = {
    width: '100%', background: 'transparent', color: 'var(--faded)',
    border: '1px solid var(--border)', padding: '12px',
    fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', letterSpacing: '2px',
    textTransform: 'uppercase', fontWeight: 400, marginTop: '8px',
    transition: 'all .2s', cursor: 'crosshair', opacity: loading ? 0.6 : 1,
  }

  const tabBtn = (m: string): React.CSSProperties => ({
    flex: 1, padding: '10px',
    background: mode === m ? 'var(--red)' : 'transparent',
    color: mode === m ? 'var(--paper)' : 'var(--faded)',
    border: `1px solid ${mode === m ? 'var(--red)' : 'rgba(242,237,228,0.09)'}`,
    fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase',
    fontFamily: 'IBM Plex Mono, monospace', transition: 'all .2s', cursor: 'crosshair',
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; cursor: crosshair; }
        :root { --ink: #0A0E1A; --ink2: #0D1221; --paper: #E8F4FF; --red: #00B4FF; --faded: #7AB8D4; --dim: #3A6A8A; --bronze: #00D4FF; --border: rgba(0,180,255,0.15); }
        html, body { height: 100%; background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
        input::placeholder { color: rgba(107,95,78,0.45); font-size: 13px; letter-spacing: 1px; }
        input:focus { outline: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--ink); position: relative; overflow: hidden; }
        .bg-word { position: fixed; font-family: 'Bebas Neue', sans-serif; color: rgba(242,237,228,0.015); letter-spacing: 12px; pointer-events: none; user-select: none; z-index: 0; line-height: 1; }
        .corner { position: fixed; width: 20px; height: 20px; z-index: 2; pointer-events: none; }
        .corner::before, .corner::after { content: ''; position: absolute; background: rgba(0,180,255,0.28); }
        .corner::before { width: 1px; height: 100%; }
        .corner::after { width: 100%; height: 1px; }
        .corner-tl { top: 24px; left: 24px; }
        .corner-tr { top: 24px; right: 24px; transform: scaleX(-1); }
        .corner-bl { bottom: 24px; left: 24px; transform: scaleY(-1); }
        .corner-br { bottom: 24px; right: 24px; transform: scale(-1); }
        .login-nav { position: fixed; top: 0; left: 0; right: 0; height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; z-index: 100; }
        .login-card { position: relative; z-index: 10; width: 100%; max-width: 880px; display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); margin-top: 52px; animation: rise .7s ease both; }
        .card-left { padding: 48px 40px; border-right: 1px solid var(--border); background: var(--ink2); position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
        .card-left::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,180,255,0.03) 27px, rgba(0,180,255,0.03) 28px); }
        .card-left-inner { position: relative; z-index: 1; }
        .card-right { padding: 48px 40px; background: var(--ink); overflow-y: auto; max-height: 90vh; }
        .login-foot { position: fixed; bottom: 0; left: 0; right: 0; padding: 0 40px; height: 38px; display: flex; align-items: center; justify-content: space-between; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); border-top: 1px solid rgba(0,180,255,0.05); }
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
        <div className="bg-word" style={{ top: '-20px', right: '-40px', fontSize: 'clamp(70px,10vw,140px)', letterSpacing: '6px', opacity: .6 }}>BRACU</div>

        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <nav className="login-nav">
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', letterSpacing: '4px', color: 'var(--paper)' }}>
            BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 2.5s step-end infinite' }} />
            System Online
          </div>
        </nav>

        <div className="login-card">
          <div style={{ position: 'absolute', top: '-1px', left: '60px', right: '60px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)', zIndex: 1 }} />

          {/* LEFT */}
          <div className="card-left">
            <div className="card-left-inner">
              <div style={{ display: 'inline-block', fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(0,180,255,0.4)', padding: '3px 9px', marginBottom: '24px', fontWeight: 700 }}>
                Classified — Students Only
              </div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px,5vw,64px)', lineHeight: 0.9, letterSpacing: '2px', color: 'var(--paper)' }}>ACADEMIC</div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(18px,2.2vw,28px)', letterSpacing: '3px', color: 'var(--red)', marginBottom: '22px' }}>COMMAND</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9, borderLeft: '2px solid rgba(0,180,255,0.3)', paddingLeft: '14px', marginBottom: '28px', maxWidth: '260px' }}>
                Study resources, professor intelligence, AI-powered advising, live USIS seat data — built for every BRACU student, forever.
              </p>
              {['Resource archive & past papers', 'Faculty intelligence board', 'AI engine — ask anything', 'Live USIS seat data', 'CGPA & credit tracker', 'AI resume & interview prep', 'Study groups & mentorship'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(0,180,255,0.06)', fontSize: '10px', color: 'var(--faded)', letterSpacing: '.3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />{f}
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: '24px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--dim)', lineHeight: 2 }}>
              BRAC University // Dhaka, Bangladesh
            </div>
          </div>

          {/* RIGHT */}
          <div className="card-right">
            <div style={{ display: 'flex', gap: '2px', marginBottom: '28px' }}>
              {(['login', 'signup', 'reset'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(''); setMsg(''); setResetOtpSent(false) }} style={tabBtn(m)}>
                  {m === 'login' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Reset'}
                </button>
              ))}
            </div>

            {msg && <div style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.25)', color: '#5fd49a', padding: '10px 14px', fontSize: '11px', marginBottom: '20px' }}>✓ {msg}</div>}
            {err && <div style={{ background: 'rgba(0,180,255,0.06)', border: '1px solid rgba(0,180,255,0.25)', color: 'var(--red)', padding: '10px 14px', fontSize: '11px', marginBottom: '20px' }}>✗ {err}</div>}

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <>
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                  Sign in to<br />the system.
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Student ID</label>
                  <input type="text" inputMode="numeric" maxLength={8} placeholder="21301234" value={id}
                    onChange={e => setId(e.target.value)} onFocus={() => setFocused('id')} onBlur={() => setFocused(null)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inpStyle('id')} autoComplete="username" />
                  <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '5px' }}>Your 8-digit BRACU student ID</div>
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

            {/* ── SIGNUP ── */}
            {mode === 'signup' && (
              <>
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                  Join BRACU<br />Command.
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>Student ID</label>
                  <input type="text" inputMode="numeric" maxLength={8} placeholder="21301234" value={id}
                    onChange={e => setId(e.target.value)} onFocus={() => setFocused('sid')} onBlur={() => setFocused(null)}
                    style={inpStyle('sid')} autoComplete="username" />
                  <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '4px' }}>Your 8-digit BRACU student ID</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>BRACU G Suite Email</label>
                  <input type="email" placeholder="username@g.bracu.ac.bd" value={gsuiteEmail}
                    onChange={e => setGsuiteEmail(e.target.value)} onFocus={() => setFocused('gsuite')} onBlur={() => setFocused(null)}
                    style={inpStyle('gsuite')} autoComplete="email" />
                  <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '4px' }}>Confirmation link will be sent here</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={lbl}>Recovery Email <span style={{ color: 'var(--dim)', fontWeight: 400 }}>(optional)</span></label>
                  <input type="email" placeholder="your.personal@gmail.com" value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)} onFocus={() => setFocused('recovery')} onBlur={() => setFocused(null)}
                    style={inpStyle('recovery')} autoComplete="email" />
                  <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '4px' }}>Used to reset password if you lose G Suite access</div>
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

            {/* ── RESET ── */}
            {mode === 'reset' && (
              <>
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                  Recover<br />your access.
                </div>
                {!resetOtpSent ? (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={lbl}>Student ID</label>
                      <input type="text" inputMode="numeric" maxLength={8} placeholder="21301234" value={id}
                        onChange={e => setId(e.target.value)} onFocus={() => setFocused('fid')} onBlur={() => setFocused(null)}
                        style={inpStyle('fid')} autoComplete="username" />
                      <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '4px' }}>OTP sent to your recovery email</div>
                    </div>
                    <button onClick={sendResetOtp} disabled={loading} style={subBtn}
                      onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                      {loading ? 'Sending OTP...' : 'Send Reset OTP →'}
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'rgba(0,180,255,0.06)', border: '1px solid var(--border)', padding: '12px 14px', marginBottom: '20px', fontSize: '10px', color: 'var(--faded)' }}>
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
                    <button onClick={() => { setResetOtpSent(false); setResetOtp(''); setMsg('') }} style={secBtn}>
                      ← Back
                    </button>
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(0,180,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 14px', fontSize: '9px', color: 'var(--dim)', lineHeight: 2 }}>
              <div><span style={{ color: 'rgba(0,180,255,0.4)' }}>✓</span> G Suite verified</div>
              <div><span style={{ color: 'rgba(0,180,255,0.4)' }}>✓</span> AES-256</div>
              <div><span style={{ color: 'rgba(0,180,255,0.4)' }}>✓</span> OTP protected</div>
              <div><span style={{ color: 'rgba(0,180,255,0.4)' }}>✓</span> Recovery email</div>
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