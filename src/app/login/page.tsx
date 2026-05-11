'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'signup'|'forgot'>('login')
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string|null>(null)
  const [btnHover, setBtnHover] = useState(false)

  const handleLogin = async () => {
    if (!/^\d{8}$/.test(id)) { setErr('Enter a valid 8-digit Student ID.'); return }
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    setErr(''); setLoading(true)
    const { data: user } = await supabase.from('users').select('recovery_email').eq('student_id', id).single()
    if (!user) { setErr('Student ID not found. Please sign up.'); setLoading(false); return }
    const { error } = await supabase.auth.signInWithPassword({ email: user.recovery_email, password: pw })
    if (error) { setErr('Incorrect password.'); setLoading(false); return }
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('student_id', id)
    localStorage.setItem('bracu_student_id', id)
    router.push('/dashboard')
    setLoading(false)
  }

  const handleSignup = async () => {
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
  }

  const handleForgot = async () => {
    if (!/^\d{8}$/.test(id)) { setErr('Enter a valid 8-digit Student ID.'); return }
    setErr(''); setLoading(true)
    const { data: user } = await supabase.from('users').select('recovery_email').eq('student_id', id).single()
    if (!user) { setErr('Student ID not found.'); setLoading(false); return }
    await supabase.auth.resetPasswordForEmail(user.recovery_email)
    setMsg('Reset link sent to your recovery email!')
    setLoading(false)
  }

  const inp = (name: string): React.CSSProperties => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focused === name ? 'var(--red)' : 'rgba(242,237,228,0.15)'}`,
    color: 'var(--paper)',
    fontFamily: 'IBM Plex Mono,monospace',
    fontSize: '15px',
    padding: '10px 0',
    outline: 'none',
    letterSpacing: '2px',
    transition: 'border-color .2s',
  })

  const lbl: React.CSSProperties = {
    fontSize: '9px',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: 'var(--faded)',
    display: 'block',
    marginBottom: '8px',
    fontWeight: 700,
  }

  const sub: React.CSSProperties = {
    width: '100%',
    background: btnHover ? 'var(--red)' : 'var(--paper)',
    color: btnHover ? 'var(--paper)' : 'var(--ink)',
    border: 'none',
    padding: '16px',
    fontFamily: 'IBM Plex Mono,monospace',
    fontSize: '11px',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginTop: '8px',
    transition: 'all .2s',
    cursor: 'crosshair',
    opacity: loading ? 0.6 : 1,
  }

  const tab = (m: string): React.CSSProperties => ({
    flex: 1,
    padding: '9px',
    background: mode === m ? 'var(--red)' : 'transparent',
    color: mode === m ? 'var(--paper)' : 'var(--faded)',
    border: `1px solid ${mode === m ? 'var(--red)' : 'rgba(242,237,228,0.09)'}`,
    fontSize: '9px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    fontFamily: 'IBM Plex Mono,monospace',
    transition: 'all .2s',
    cursor: 'crosshair',
  })

  const Field = ({ name, label, type, placeholder, value, onChange, hint }: any) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={lbl}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused(null)}
        onKeyDown={(e) => e.key === 'Enter' && mode === 'login' && handleLogin()}
        maxLength={name === 'id' ? 8 : undefined}
        style={inp(name)}
      />
      {hint && <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '5px', letterSpacing: '.5px' }}>{hint}</div>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>

      {/* Ghost background text */}
      <div style={{ position: 'fixed', fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(160px,24vw,340px)', color: 'rgba(242,237,228,0.015)', letterSpacing: '12px', bottom: '-40px', left: '-20px', pointerEvents: 'none', userSelect: 'none', zIndex: 0, lineHeight: 1 }}>CMD</div>
      <div style={{ position: 'fixed', fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(70px,10vw,140px)', color: 'rgba(242,237,228,0.015)', letterSpacing: '6px', top: '-20px', right: '-40px', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>BRACU</div>

      {/* Corner marks */}
      {[{ top: '24px', left: '24px' }, { top: '24px', right: '24px', transform: 'scaleX(-1)' }, { bottom: '24px', left: '24px', transform: 'scaleY(-1)' }, { bottom: '24px', right: '24px', transform: 'scale(-1)' }].map((s, i) => (
        <div key={i} style={{ position: 'fixed', width: '20px', height: '20px', zIndex: 2, pointerEvents: 'none', ...s }}>
          <div style={{ position: 'absolute', width: '1px', height: '100%', background: 'rgba(232,57,14,0.3)' }} />
          <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(232,57,14,0.3)' }} />
        </div>
      ))}

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 100 }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', letterSpacing: '4px', color: 'var(--paper)' }}>
          BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 2.5s step-end infinite' }} />
          System Online
        </div>
      </nav>

      {/* Main Card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '880px', display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', marginTop: '52px', animation: 'rise .6s ease both' }}>

        {/* Top accent line */}
        <div style={{ position: 'absolute', top: '-1px', left: '60px', right: '60px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)', zIndex: 1 }} />

        {/* Left Panel */}
        <div style={{ padding: '48px 40px', borderRight: '1px solid var(--border)', background: 'var(--ink2)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(242,237,228,0.04) 27px,rgba(242,237,228,0.04) 28px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.4)', padding: '3px 9px', marginBottom: '24px', fontWeight: 700 }}>
              Classified — Students Only
            </div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(40px,5vw,64px)', lineHeight: 0.9, letterSpacing: '2px', color: 'var(--paper)' }}>ACADEMIC</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(18px,2.2vw,28px)', letterSpacing: '3px', color: 'var(--red)', marginBottom: '22px' }}>COMMAND</div>
            <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9, borderLeft: '2px solid rgba(232,57,14,0.3)', paddingLeft: '14px', marginBottom: '28px', maxWidth: '260px' }}>
              Study resources, professor intelligence, AI-powered advising, live USIS seat data — built for every BRACU student, forever.
            </p>
            {[
              'Resource archive & past papers',
              'Faculty intelligence board',
              'AI engine — ask anything academic',
              'Live USIS seat data — 30s refresh',
              'CGPA & credit tracker',
              'AI resume & interview prep',
              'Study groups & mentorship',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '10px', color: 'var(--faded)', letterSpacing: '.3px' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />{f}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--dim)', lineHeight: 2, position: 'relative', zIndex: 1 }}>
            BRAC University // Dhaka, BD<br />
            Supabase · AES-256 · JWT · bcrypt
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ padding: '48px 40px', background: 'var(--ink)' }}>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '28px' }}>
            {(['login', 'signup', 'forgot'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(''); setMsg('') }} style={tab(m)}>
                {m === 'login' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Reset'}
              </button>
            ))}
          </div>

          {/* Messages */}
          {msg && (
            <div style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.25)', color: '#5fd49a', padding: '10px 14px', fontSize: '11px', marginBottom: '20px', letterSpacing: '.3px' }}>
              ✓ {msg}
            </div>
          )}
          {err && (
            <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', color: 'var(--red)', padding: '10px 14px', fontSize: '11px', marginBottom: '20px', letterSpacing: '.3px' }}>
              ✗ {err}
            </div>
          )}

          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                Sign in to<br />the system.
              </div>
              <Field name="id" label="Student ID" type="text" placeholder="21301234" value={id} onChange={(e: any) => setId(e.target.value)} hint="Your 8-digit BRACU student ID" />
              <Field name="pw" label="Password" type="password" placeholder="••••••••" value={pw} onChange={(e: any) => setPw(e.target.value)} hint="Min. 6 characters" />
              <button onClick={handleLogin} disabled={loading} style={sub} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                {loading ? 'Authenticating...' : 'Authenticate →'}
              </button>
            </>
          )}

          {/* SIGNUP */}
          {mode === 'signup' && (
            <>
              <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                Join BRACU<br />Command.
              </div>
              <Field name="id" label="Student ID" type="text" placeholder="21301234" value={id} onChange={(e: any) => setId(e.target.value)} hint="Your 8-digit BRACU student ID" />
              <Field name="pw" label="Password" type="password" placeholder="Min 8 characters" value={pw} onChange={(e: any) => setPw(e.target.value)} />
              <Field name="pw2" label="Confirm Password" type="password" placeholder="Repeat password" value={pw2} onChange={(e: any) => setPw2(e.target.value)} />
              <Field name="email" label="Recovery Email" type="email" placeholder="your@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} hint="Used only for password reset — never shared" />
              <button onClick={handleSignup} disabled={loading} style={sub} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </>
          )}

          {/* FORGOT */}
          {mode === 'forgot' && (
            <>
              <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', marginBottom: '28px', lineHeight: 1.1 }}>
                Recover<br />your access.
              </div>
              <Field name="id" label="Student ID" type="text" placeholder="21301234" value={id} onChange={(e: any) => setId(e.target.value)} hint="Reset link sent to your recovery email" />
              <button onClick={handleForgot} disabled={loading} style={sub} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
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
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0 40px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--dim)', borderTop: '1px solid rgba(242,237,228,0.05)' }}>
        <div>BRACU/CMD — v2.0</div>
        <div>Built by a CSE student · For every student that follows</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { cursor: crosshair; box-sizing: border-box; }
        :root { --ink: #0C0B09; --ink2: #111009; --paper: #F2EDE4; --red: #E8390E; --faded: #6B5F4E; --dim: #2E2A23; --border: rgba(242,237,228,0.09); }
        body { background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; margin: 0; }
        input::placeholder { color: rgba(107,95,78,0.45); letter-spacing: 1px; font-size: 13px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:680px) {
          .login-card { grid-template-columns: 1fr !important; }
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}