'use client'
import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'

const LAYERS = [
  {
    id: 'auth', icon: '🔐', title: 'Authentication', status: 'live',
    desc: 'Student ID-based authentication. No Gmail, no OAuth, no third-party login.',
    details: [
      'Student ID (8-digit) + password — only BRACU students can register',
      'Supabase Auth handles session management with JWT tokens',
      'Passwords hashed with bcrypt (cost factor 12) — never stored in plaintext',
      'Session tokens expire automatically — no permanent login',
      'Recovery via OTP sent to registered email only',
    ],
    tech: ['Supabase Auth', 'bcrypt(12)', 'JWT', 'OTP']
  },
  {
    id: 'data', icon: '🗄️', title: 'Data Protection', status: 'live',
    desc: 'All sensitive data encrypted at rest and in transit. Your data is yours.',
    details: [
      'All database connections use TLS 1.3 encryption in transit',
      'Supabase PostgreSQL encrypts data at rest using AES-256',
      'Row Level Security (RLS) enabled — users can only access their own data',
      'Recovery emails stored encrypted — never shown to other users',
      'No selling, sharing, or monetizing user data — ever',
    ],
    tech: ['AES-256', 'TLS 1.3', 'RLS', 'PostgreSQL']
  },
  {
    id: 'api', icon: '🔌', title: 'API Security', status: 'live',
    desc: 'All API calls authenticated. No public endpoints that expose user data.',
    details: [
      'Supabase anon key used for client — Row Level Security prevents unauthorized access',
      'Server-side operations use service role key — never exposed to browser',
      'All API requests require valid JWT token in Authorization header',
      'CORS configured — only bracu-command.vercel.app can call the API',
      'Rate limiting on auth endpoints — prevents brute force attacks',
    ],
    tech: ['Supabase RLS', 'JWT Bearer', 'CORS', 'Rate Limiting']
  },
  {
    id: 'privacy', icon: '👤', title: 'Privacy', status: 'live',
    desc: 'Zero tracking. No ads. No analytics that identify you. Anonymous by design.',
    details: [
      'No Google Analytics or any tracking pixels',
      'Confessions and anonymous reviews — Student IDs never stored with posts',
      'No IP address logging for user activity',
      'No third-party SDKs that harvest data',
      'Faculty reviews and confessions are cryptographically anonymous',
    ],
    tech: ['Zero Tracking', 'Anonymous Posts', 'No Ads', 'No Analytics']
  },
  {
    id: 'infra', icon: '☁️', title: 'Infrastructure', status: 'live',
    desc: 'Hosted on enterprise-grade infrastructure with automatic security updates.',
    details: [
      'Frontend on Vercel — automatic HTTPS, DDoS protection, edge network',
      'Database on Supabase — SOC2 compliant, enterprise PostgreSQL',
      'Automatic SSL certificate renewal — never expires',
      'Vercel edge network — requests served from nearest datacenter',
      'No user data stored on developer machines or local systems',
    ],
    tech: ['Vercel Edge', 'Supabase Cloud', 'Auto HTTPS', 'SOC2']
  },
  {
    id: 'code', icon: '💻', title: 'Code Security', status: 'live',
    desc: 'Open source practices. No secrets in code. Environment variables for all keys.',
    details: [
      'All API keys stored as environment variables — never in source code',
      'GitHub repo is private — source code not publicly accessible',
      'Dependency updates monitored with npm audit',
      'TypeScript used throughout — prevents common runtime errors',
      'No eval(), no innerHTML, no XSS vectors',
    ],
    tech: ['Env Variables', 'TypeScript', 'Private Repo', 'npm audit']
  },
]

const FAQ = [
  { q: 'Can other students see my Student ID?', a: 'No. Your Student ID is only used for login. It is never displayed publicly on any page. Anonymous posts and reviews have no connection to your Student ID.' },
  { q: 'Can the developer see my password?', a: 'No. Passwords are hashed with bcrypt before storage. Even the database administrator cannot recover your original password. Only you know it.' },
  { q: 'Is my recovery email safe?', a: 'Yes. Recovery emails are stored encrypted and are only used for password reset OTPs. They are never shown to other users or used for marketing.' },
  { q: 'What data does BRACU Command collect?', a: 'Only what you provide: Student ID, hashed password, and optional recovery email. Usage data (which pages you visit) is not tracked or stored.' },
  { q: 'Can I delete my account?', a: 'Yes. Contact the developer or use the account settings page (coming soon). All your data will be permanently deleted within 24 hours.' },
  { q: 'Is this site safe to use on university WiFi?', a: 'Yes. All connections use HTTPS/TLS. Even on university WiFi, no one can intercept your login credentials or session data.' },
]

export default function SecurityPage() {
  const [expanded, setExpanded] = useState<string | null>('auth')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  return (
    <PageLayout
      eyebrow="Security Architecture"
      title="Every layer<br/>hardened."
      subtitle="How BRACU Command protects your data — authentication, encryption, privacy, and infrastructure."
    >
      {/* Security score */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '8px', fontWeight: 700 }}>// SECURITY STATUS</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(40px,8vw,64px)', color: '#5fd49a', letterSpacing: '2px', lineHeight: 1 }}>SECURE</div>
            <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '6px', lineHeight: 1.8 }}>All {LAYERS.length} security layers active. No known vulnerabilities.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Encryption', val: 'AES-256', ok: true },
              { label: 'Auth', val: 'JWT+bcrypt', ok: true },
              { label: 'HTTPS', val: 'TLS 1.3', ok: true },
              { label: 'Tracking', val: 'None', ok: true },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--ink)', border: '1px solid rgba(95,212,154,0.15)', padding: '10px 12px' }}>
                <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: '#5fd49a', fontWeight: 700 }}>✓ {s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security layers */}
      <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>SECURITY LAYERS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '32px' }}>
        {LAYERS.map(layer => (
          <div key={layer.id}>
            <div
              onClick={() => setExpanded(expanded === layer.id ? null : layer.id)}
              style={{ background: expanded === layer.id ? 'var(--ink2)' : 'var(--ink)', border: `1px solid ${expanded === layer.id ? 'rgba(232,57,14,0.2)' : 'var(--border)'}`, padding: '16px 20px', cursor: 'crosshair', transition: 'all .15s', borderLeft: `3px solid ${expanded === layer.id ? 'var(--red)' : '#5fd49a'}` }}
              onMouseEnter={e => { if (expanded !== layer.id) e.currentTarget.style.background = 'var(--ink2)' }}
              onMouseLeave={e => { if (expanded !== layer.id) e.currentTarget.style.background = 'var(--ink)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{layer.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)' }}>{layer.title}</div>
                    <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5fd49a', border: '1px solid rgba(95,212,154,0.3)', padding: '1px 6px' }}>● ACTIVE</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.6 }}>{layer.desc}</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--faded)', flexShrink: 0 }}>{expanded === layer.id ? '▲' : '▼'}</div>
              </div>
            </div>

            {expanded === layer.id && (
              <div style={{ background: 'rgba(242,237,228,0.02)', border: '1px solid var(--border)', borderTop: 'none', padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {layer.details.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--faded)', lineHeight: 1.7, padding: '6px 0', borderBottom: '1px solid rgba(242,237,228,0.04)' }}>
                      <span style={{ color: '#5fd49a', flexShrink: 0 }}>✓</span>{d}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {layer.tech.map((t, i) => (
                    <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid rgba(232,57,14,0.25)', padding: '3px 10px', color: 'rgba(232,57,14,0.7)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>SECURITY FAQ</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
        {FAQ.map((f, i) => (
          <div key={i}>
            <div onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              style={{ background: faqOpen === i ? 'var(--ink2)' : 'var(--ink)', border: '1px solid var(--border)', padding: '14px 18px', cursor: 'crosshair', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', transition: 'background .15s' }}
              onMouseEnter={e => { if (faqOpen !== i) e.currentTarget.style.background = 'var(--ink2)' }}
              onMouseLeave={e => { if (faqOpen !== i) e.currentTarget.style.background = 'var(--ink)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.4 }}>{f.q}</div>
              <span style={{ fontSize: '12px', color: 'var(--faded)', flexShrink: 0 }}>{faqOpen === i ? '▲' : '▼'}</span>
            </div>
            {faqOpen === i && (
              <div style={{ background: 'rgba(242,237,228,0.02)', border: '1px solid var(--border)', borderTop: 'none', padding: '14px 18px', fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Responsible disclosure */}
      <div style={{ background: 'rgba(232,57,14,0.05)', border: '1px solid rgba(232,57,14,0.2)', padding: '20px 24px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px', fontWeight: 700 }}>RESPONSIBLE DISCLOSURE</div>
        <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
          Found a security vulnerability? Please report it responsibly. Do not exploit it. Contact the developer at <span style={{ color: 'var(--bronze)' }}>sheikhwaliur001@gmail.com</span> with details. We will respond within 48 hours and credit you in the security acknowledgments.
        </p>
      </div>
    </PageLayout>
  )
}