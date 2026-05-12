'use client'
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [btnHover, setBtnHover] = useState(false)

  const handleLogin = useCallback(async () => {
    // Rate limit — max 5 login attempts per 15 minutes
    const { allowed, waitSeconds } = checkRateLimit({ key: 'login', limitMs: 300000, maxAttempts: 10 })
    if (!allowed) {
      setErr(`Too many attempts. Please wait ${waitSeconds} seconds.`)
      return
    }
    if (!/^\d{8}$/.test(id)) { setErr('Enter a valid 8-digit Student ID.'); return }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr(''); setLoading(true)
    const { data: user, error: userError } = await supabase
  .from('users')
  .select('recovery_email, password_hash')
  .eq('student_id', id)
  .single()

if (userError || !user) {
  setErr('Student ID not found. Please sign up.')
  setLoading(false)
  return
}

// Try Supabase auth if recovery_email exists
if (user.recovery_email) {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.recovery_email,
    password: pw
  })
  if (authError) {
    setErr('Incorrect password.')
    setLoading(false)
    return
  }
}

// Set session cookie
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

  const handleSignup = useCallback(async () => {
    if (!/^\d{8}$/.test(id)) { setErr('Enter a valid 8-digit Student ID.'); return }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (pw !== pw2) { setErr('Passwords do not match.'); return }
    if (!email.includes('@')) { setErr('Enter a valid email.'); return }
    setErr(''); setLoading(true)
    const { data: existing } = await supabase.from('users').select('student_id').eq('student_id', id).single()
    if (existing) { setErr('Student ID already registered. Please login.'); setLoading(false); return }
    const { error: authError } = await supabase.auth.signUp({ email, password: pw })
    if (authError) { setErr(authError.message); setLoading(false); return }
    await supabase.from('users').insert({ student_id: id, password_hash: 'supabase_auth', recovery_email: email })
    setMsg('Account created! Check your email to verify, then login.')
    setMode('login')
    setLoading(false)
  }, [id, pw, pw2, email])

  const handleForgot = useCallback(async () => {
    if (!/^\d{8}$/.test(id)) { setErr('Enter a valid 8-digit Student ID.'); return }
    setErr(''); setLoading(true)
    const { data: user } = await supabase.from('users').select('recovery_email').eq('student_id', id).single()
    if (!user) { setErr('Student ID not found.'); setLoading(false); return }
    await supabase.auth.resetPasswordForEmail(user.recovery_email)
    setMsg('Reset link sent to your recovery email!')
    setLoading(false)
  }, [id])

  const inpStyle = (name: string): React.CSSProperties => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focused === name ? 'var(--red)' : 'rgba(242,237,228,0.15)'}`,
    color: 'var(--paper)',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: '16px',
    padding: '10px 0',
    outline: 'none',
    letterSpacing: '2px',
    transition: 'border-color .2s',
    WebkitAppearance: 'none',
  })

  const lbl: React.CSSProperties = {
    fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase',
    color: 'var(--faded)', display: 'block', marginBottom: '8px', fontWeight: 700,
  }

  const subBtn: React.CSSProperties = {
    width: '100%',
    background: btnHover ? 'var(--red)' : 'var(--paper)',
    color: btnHover ? 'var(--paper)' : 'var(--ink)',
    border: 'none', padding: '16px',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
    fontWeight: 700, marginTop: '8px', transition: 'all .2s',
    cursor: 'crosshair', opacity: loading ? 0.6 : 1,
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
        :root { --ink: #F2EDE4; --ink2: #E8E0D4; --paper: #1A0F0A; --red: #C0440E; --faded: #5C4033; --dim: #9E8E82; --bronze: #7A4E28; --border: rgba(26,15,10,0.15); }
        html, body { height: 100%; background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
        input::placeholder { color: rgba(107,95,78,0.45); font-size: 13px; letter-spacing: 1px; }
        input:focus { outline: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .login-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; background: var(--ink);
          position: relative; overflow: hidden;
        }

        .bg-word {
          position: fixed; font-family: 'Bebas Neue', sans-serif;
          color: rgba(242,237,228,0.015); letter-spacing: 12px;
          pointer-events: none; user-select: none; z-index: 0; line-height: 1;
        }

        .corner { position: fixed; width: 20px; height: 20px; z-index: 2; pointer-events: none; }
        .corner::before, .corner::after { content: ''; position: absolute; background: rgba(232,57,14,0.28); }
        .corner::before { width: 1px; height: 100%; }
        .corner::after { width: 100%; height: 1px; }
        .corner-tl { top: 24px; left: 24px; }
        .corner-tr { top: 24px; right: 24px; transform: scaleX(-1); }
        .corner-bl { bottom: 24px; left: 24px; transform: scaleY(-1); }
        .corner-br { bottom: 24px; right: 24px; transform: scale(-1); }

        .login-nav {
          position: fixed; top: 0; left: 0; right: 0; height: 52px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; z-index: 100;
        }

        .login-card {
          position: relative; z-index: 10; width: 100%; max-width: 880px;
          display: grid; grid-template-columns: 1fr 1fr;
          border: 1px solid var(--border); margin-top: 52px;
          animation: rise .7s ease both;
        }

        .card-left {
          padding: 48px 40px; border-right: 1px solid var(--border);
          background: var(--ink2); position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-left::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(242,237,228,0.04) 27px, rgba(242,237,228,0.04) 28px);
        }

        .card-left-inner { position: relative; z-index: 1; }

        .card-right { padding: 48px 40px; background: var(--ink); }

        .login-foot {
          position: fixed; bottom: 0; left: 0; right: 0; padding: 0 40px; height: 38px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--dim); border-top: 1px solid rgba(242,237,228,0.05);
        }

        /* MOBILE */
        @media (max-width: 680px) {
          .login-card {
            grid-template-columns: 1fr;
            margin-top: 60px;
            max-width: 100%;
          }
          .card-left { display: none; }
          .card-right { padding: 32px 24px; }
          .login-nav { padding: 0 20px; }
          .login-foot { padding: 0 20px; font-size: 8px; }
          .login-page { padding: 16px; align-items: flex-start; padding-top: 72px; }
        }
      `}</style>

      <div className="login-page">
        {/* Ghost bg */}
        <div className="bg-word" style={{ bottom: '-40px', left: '-20px', fontSize: 'clamp(160px,24vw,340px)' }}>CMD</div>
        <div className="bg-word" style={{ top: '-20px', right: '-40px', fontSize: 'clamp(70px,10vw,140px)', letterSpacing: '6px', opacity: .6 }}>BRACU</div>

        {/* Corners */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        {/* Nav */}
        <nav className="login-nav">
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', letterSpacing: '4px', color: 'var(--paper)' }}>
            BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 2.5s step-end infinite' }} />
            System Online
          </div>
        </nav>

        {/* Card */}
        <div className="login-card">
          {/* Top accent */}
          <div style={{ position: 'absolute', top: '-1px', left: '60px', right: '60px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)', zIndex: 1 }} />

          {/* Left */}
          <div className="card-left">
            <div className="card-left-inner">
              <div style={{ display: 'inline-block', fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.4)', padding: '3px 9px', marginBottom: '24px', fontWeight: 700 }}>
                Classified — Students Only
              </div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px,5vw,64px)', lineHeight: 0.9, letterSpacing: '2px', color: 'var(--paper)' }}>ACADEMIC</div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(18px,2.2vw,28px)', letterSpacing: '3px', color: 'var(--red)', marginBottom: '22px' }}>COMMAND</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9, borderLeft: '2px solid rgba(232,57,14,0.3)', paddingLeft: '14px', marginBottom: '28px', maxWidth: '260px' }}>
                Study resources, professor intelligence, AI-powered advising, live USIS seat data — built for every BRACU student, forever.
              </p>
              {['Resource archive & past papers', 'Faculty intelligence board', 'AI engine — ask anything', 'Live USIS seat data', 'CGPA & credit tracker', 'AI resume & interview prep', 'Study groups & mentorship'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '10px', color: 'var(--faded)', letterSpacing: '.3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />{f}
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: '24px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--dim)', lineHeight: 2 }}>
              BRAC University // Dhaka, BD<br />Supabase · AES-256 · JWT · bcrypt
            </div>
          </div>

          {/* Right */}
          <div className="card-right">
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '28px' }}>
              {(['login', 'signup', 'forgot'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setErr(''); setMsg('') }} style={tabBtn(m)}>
                  {m === 'login' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Reset'}
                </button>
              ))}
            </div>

            {/* Messages */}
            {msg && <div style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.25)', color: '#5fd49a', padding: '10px 14px', fontSize: '11px', marginBottom: '20px' }}>✓ {msg}</div>}
            {err && <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', color: 'var(--red)', padding: '10px 14px', fontSize: '11px', marginBottom: '20px' }}>✗ {err}</div>}

            {/* LOGIN */}
            {mode === 'login' && (
              <>
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                  Sign in to<br />the system.
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Student ID</label>
                  <input
                    type="text" inputMode="numeric" maxLength={8}
                    placeholder="21301234" value={id}
                    onChange={e => setId(e.target.value)}
                    onFocus={() => setFocused('id')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={inpStyle('id')}
                    autoComplete="username"
                  />
                  <div style={{ fontSize: '9px', color: 'rgba(107,95,78,0.5)', marginTop: '5px' }}>Your 8-digit BRACU student ID</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Password</label>
                  <input
                    type="password" placeholder="••••••••" value={pw}
                    onChange={e => setPw(e.target.value)}
                    onFocus={() => setFocused('pw')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={inpStyle('pw')}
                    autoComplete="current-password"
                  />
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
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                  Join BRACU<br />Command.
                </div>
                {[
                  { name: 'sid', label: 'Student ID', type: 'text', ph: '21301234', val: id, fn: setId, hint: 'Your 8-digit BRACU student ID', mode: 'numeric' as const, auto: 'username' },
                  { name: 'spw', label: 'Password', type: 'password', ph: 'Min 8 characters', val: pw, fn: setPw, hint: '', mode: undefined, auto: 'new-password' },
                  { name: 'spw2', label: 'Confirm Password', type: 'password', ph: 'Repeat password', val: pw2, fn: setPw2, hint: '', mode: undefined, auto: 'new-password' },
                  { name: 'sem', label: 'Recovery Email', type: 'email', ph: 'your@email.com', val: email, fn: setEmail, hint: 'Used only for password reset', mode: undefined, auto: 'email' },
                ].map(f => (
                  <div key={f.name} style={{ marginBottom: '18px' }}>
                    <label style={lbl}>{f.label}</label>
                    <input
                      type={f.type} placeholder={f.ph} value={f.val}
                      onChange={e => f.fn(e.target.value)}
                      onFocus={() => setFocused(f.name)}
                      onBlur={() => setFocused(null)}
                      inputMode={f.mode}
                      autoComplete={f.auto}
                      style={inpStyle(f.name)}
                    />
                    {f.hint && <div style={{ fontSize: '9px', color: 'rgba(107,95,78,0.5)', marginTop: '5px' }}>{f.hint}</div>}
                  </div>
                ))}
                <button onClick={handleSignup} disabled={loading} style={subBtn}
                  onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                  {loading ? 'Creating Account...' : 'Create Account →'}
                </button>
              </>
            )}

            {/* FORGOT */}
            {mode === 'forgot' && (
              <>
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                  Recover<br />your access.
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={lbl}>Student ID</label>
                  <input
                    type="text" inputMode="numeric" maxLength={8}
                    placeholder="21301234" value={id}
                    onChange={e => setId(e.target.value)}
                    onFocus={() => setFocused('fid')}
                    onBlur={() => setFocused(null)}
                    style={inpStyle('fid')}
                    autoComplete="username"
                  />
                  <div style={{ fontSize: '9px', color: 'rgba(107,95,78,0.5)', marginTop: '5px' }}>Reset link sent to your recovery email</div>
                </div>
                <button onClick={handleForgot} disabled={loading} style={subBtn}
                  onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </>
            )}

            {/* Security badges */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(242,237,228,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 14px', fontSize: '9px', color: 'rgba(107,95,78,0.45)', lineHeight: 2 }}>
              <div><span style={{ color: 'rgba(232,57,14,0.4)' }}>✓</span> Supabase auth</div>
              <div><span style={{ color: 'rgba(232,57,14,0.4)' }}>✓</span> AES-256</div>
              <div><span style={{ color: 'rgba(232,57,14,0.4)' }}>✓</span> Unique Student ID</div>
              <div><span style={{ color: 'rgba(232,57,14,0.4)' }}>✓</span> OTP recovery</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-foot">
          <div>BRACU/CMD — v2.0</div>
          <div>Built by a CSE student · For every student that follows</div>
        </div>
      </div>
    </>
  )
}