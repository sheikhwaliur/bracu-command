'use client'
import { useState, useEffect } from 'react'
import { getStudentId } from '@/lib/session'
import { useRouter } from 'next/navigation'

const STRIP_ITEMS = ['Academic AI', 'Student ID Auth', 'Faculty Reviews', 'Live USIS Data', 'CGPA Calculator', 'AI Resume', 'Mock Exams', 'Study Groups', 'Course Ratings', 'Campus Map']

export default function PageLayout({ children, title, subtitle, eyebrow }: {
  children: React.ReactNode
  title: string
  subtitle?: string
  eyebrow?: string
}) {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    setStudentId(getStudentId())
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(12,11,9,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', zIndex: 500 }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', letterSpacing: '4px' }}>
          BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />Online
          </div>
          <div style={{ fontSize: '10px', color: 'var(--faded)', border: '1px solid var(--border)', padding: '5px 12px', letterSpacing: '1px' }}>
            ID: {studentId || '—'}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--faded)', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>
            ← Dashboard
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/session', { method: 'DELETE' })
              router.push('/login')
            }}
            style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--faded)', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Strip */}
      <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', padding: '12px 0', background: 'rgba(242,237,228,0.01)', marginTop: '52px' }}>
        <div style={{ display: 'flex', gap: '52px', animation: 'scroll 26s linear infinite', width: 'max-content' }}>
          {[...Array(2)].flatMap(() => STRIP_ITEMS.map((t, i) => (
            <span key={t + i} style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t}<span style={{ color: 'rgba(232,57,14,0.35)' }}>//</span>
            </span>
          )))}
        </div>
      </div>

      {/* Page Hero */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 32px', borderBottom: '1px solid var(--border)' }}>
        {eyebrow && (
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '16px', height: '1px', background: 'var(--red)', display: 'inline-block' }} />
            {eyebrow}
          </div>
        )}
        <div
          style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.1, marginBottom: '10px' }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--faded)', lineHeight: 1.9, maxWidth: '520px' }}>{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 60px' }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '22px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '17px', letterSpacing: '3px' }}>
            BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'var(--dim)', marginTop: '4px', textTransform: 'uppercase' }}>
            Academic Intelligence System — v2.0
          </div>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textAlign: 'right', lineHeight: 1.8 }}>
          Built by a CSE student.<br />For every student that follows.
        </div>
      </footer>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ position: 'fixed', bottom: '32px', right: '32px', background: 'var(--red)', color: 'var(--paper)', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'crosshair', zIndex: 400, transition: 'all .2s', opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'all' : 'none' }}>
        ↑
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { cursor: crosshair; box-sizing: border-box; margin: 0; padding: 0; }
        :root { --ink: #F2EDE4; --ink2: #E8E0D4; --paper: #1A0F0A; --red: #C0440E; --faded: #5C4033; --dim: #9E8E82; --bronze: #7A4E28; --border: rgba(26,15,10,0.15); }
        body { background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        input::placeholder { color: rgba(107,95,78,0.45); font-size: 11px; }
        @media(max-width:900px) { nav { padding: 0 16px !important; } .wrap { padding: 0 16px !important; } }
      `}</style>
    </div>
  )
}