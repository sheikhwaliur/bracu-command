'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TILES = [
  { id: 'resources', num: '01', icon: '📚', name: 'Resource Archive', desc: 'Past papers, notes, Drive links, YouTube — community rated.', tag: '// resource.cmd', status: 'live', category: 'Academic' },
  { id: 'faculty', num: '02', icon: '⭐', name: 'Faculty Intelligence', desc: 'Real BRACU faculty reviews — anonymous, verified students only.', tag: '// faculty.cmd', status: 'live', category: 'Academic' },
  { id: 'ai', num: '03', icon: '🤖', name: 'AI Engine', desc: 'Ask anything academic — topics, past papers, assignments, routines.', tag: '// ai.cmd', status: 'live', category: 'Academic' },
  { id: 'usis', num: '04', icon: '🪑', name: 'Live USIS Seats', desc: 'Real-time course seat availability. Refreshes every 30 seconds.', tag: '// usis.live', status: 'live', category: 'Academic' },
  { id: 'cgpa', num: '05', icon: '📊', name: 'CGPA Calculator', desc: 'Enter your grades and get your CGPA instantly.', tag: '// cgpa.cmd', status: 'live', category: 'Academic' },
  { id: 'credits', num: '06', icon: '🎯', name: 'Credit Tracker', desc: 'Track credits done vs remaining. Know when you graduate.', tag: '// credits.cmd', status: 'live', category: 'Academic' },
  { id: 'planner', num: '07', icon: '📋', name: 'Course Planner', desc: 'Plan all semesters until graduation. Visual roadmap.', tag: '// planner.cmd', status: 'live', category: 'Academic' },
  { id: 'countdown', num: '08', icon: '📅', name: 'Exam Countdown', desc: 'Days left until midterm and final. Never miss a deadline.', tag: '// countdown.cmd', status: 'live', category: 'Academic' },
  { id: 'deadlines', num: '09', icon: '📝', name: 'Deadline Tracker', desc: 'Add assignment deadlines. Get reminders before they hit.', tag: '// deadlines.cmd', status: 'live', category: 'Academic' },
  { id: 'leaderboard', num: '10', icon: '🏆', name: 'Leaderboard', desc: 'Top resource contributors. Recognition for helping others.', tag: '// leaderboard.cmd', status: 'live', category: 'Community' },
  { id: 'confessions', num: '11', icon: '💬', name: 'Confession Board', desc: 'Anonymous BRACU student experiences and confessions.', tag: '// confess.cmd', status: 'live', category: 'Community' },
  { id: 'studygroups', num: '12', icon: '🤝', name: 'Study Groups', desc: 'Find students taking the same courses. Form study groups.', tag: '// groups.cmd', status: 'live', category: 'Community' },
  { id: 'noticeboard', num: '13', icon: '📣', name: 'Notice Board', desc: 'Important BRACU announcements and student notices.', tag: '// notices.cmd', status: 'live', category: 'Community' },
  { id: 'courserating', num: '14', icon: '🗳️', name: 'Course Ratings', desc: 'Rate courses not just faculty. Know what to expect.', tag: '// courses.cmd', status: 'live', category: 'Community' },
  { id: 'mentorship', num: '15', icon: '🗺️', name: 'Mentorship', desc: 'Senior roadmaps and direct mentorship via email or WhatsApp.', tag: '// mentor.cmd', status: 'live', category: 'Community' },
  { id: 'discussions', num: '16', icon: '💭', name: 'Discussions', desc: 'Course-specific Q&A. Answers from students who took it.', tag: '// discuss.cmd', status: 'live', category: 'Community' },
  { id: 'resume', num: '17', icon: '📄', name: 'AI Resume Builder', desc: 'AI builds your CV based on your courses and experience.', tag: '// resume.cmd', status: 'live', category: 'AI Tools' },
  { id: 'interview', num: '18', icon: '🎤', name: 'Interview Prep', desc: 'AI asks you real interview questions. Practice and improve.', tag: '// interview.cmd', status: 'live', category: 'AI Tools' },
  { id: 'flashcards', num: '19', icon: '📖', name: 'Flashcard Generator', desc: 'AI makes flashcards from your notes. Study smarter.', tag: '// flashcards.cmd', status: 'live', category: 'AI Tools' },
  { id: 'mockexam', num: '20', icon: '🧪', name: 'Mock Exam Generator', desc: 'AI creates practice exams from past papers. Exam-ready.', tag: '// mockexam.cmd', status: 'live', category: 'AI Tools' },
  { id: 'career', num: '21', icon: '💡', name: 'Career Path Advisor', desc: 'AI maps your career path based on courses and interests.', tag: '// career.cmd', status: 'live', category: 'AI Tools' },
  { id: 'map', num: '22', icon: '🗺️', name: 'Campus Map', desc: 'Interactive BRACU campus map. Find buildings and rooms.', tag: '// map.cmd', status: 'live', category: 'Utility' },
  { id: 'bus', num: '23', icon: '🚌', name: 'Bus Schedule', desc: 'BRACU bus timings and routes. Never miss your bus.', tag: '// bus.cmd', status: 'live', category: 'Utility' },
  { id: 'cafeteria', num: '24', icon: '🍽️', name: 'Cafeteria Menu', desc: 'Daily menu and ratings. Know what\'s good today.', tag: '// cafe.cmd', status: 'live', category: 'Utility' },
  { id: 'emergency', num: '25', icon: '📞', name: 'Emergency Contacts', desc: 'All important BRACU numbers in one place.', tag: '// emergency.cmd', status: 'live', category: 'Utility' },
  { id: 'links', num: '26', icon: '🌐', name: 'Useful Links', desc: 'All important BRACU portals — USIS, email, library and more.', tag: '// links.cmd', status: 'live', category: 'Utility' },
  { id: 'security', num: '27', icon: '🔒', name: 'Security', desc: 'Full security architecture. Every layer explained.', tag: '// security.cmd', status: 'live', category: 'System' },
  { id: 'stack', num: '28', icon: '⚙️', name: 'Tech Stack', desc: 'Full technical architecture. $0/month. Built to scale.', tag: '// stack.cmd', status: 'live', category: 'System' },
]

const CATEGORIES = ['All', 'Academic', 'Community', 'AI Tools', 'Utility', 'System']

export default function Dashboard() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [timer, setTimer] = useState(30)
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('bracu_student_id')
    if (!id) { router.push('/login'); return }
    setStudentId(id)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setTimer(p => p <= 0 ? 30 : p - 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const filtered = TILES.filter(t => {
    const matchCat = category === 'All' || t.category === category
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const cols = isMobile ? '1fr' : 'repeat(3,1fr)'
  const cols2 = isMobile ? '1fr' : 'repeat(2,1fr)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 40px', background: 'rgba(12,11,9,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', zIndex: 500 }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', letterSpacing: '4px' }}>
          BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            {!isMobile && 'Online'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--faded)', border: '1px solid var(--border)', padding: '4px 10px', letterSpacing: '1px' }}>
            {isMobile ? studentId : `ID: ${studentId}`}
          </div>
          <button onClick={() => { localStorage.removeItem('bracu_student_id'); router.push('/login') }}
            style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--faded)', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>
            {isMobile ? '✕' : 'Sign Out'}
          </button>
        </div>
      </nav>

      {/* Strip */}
      <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', padding: '12px 0', background: 'rgba(242,237,228,0.01)', marginTop: '52px' }}>
        <div style={{ display: 'flex', gap: '52px', animation: 'scroll 26s linear infinite', width: 'max-content' }}>
          {[...Array(2)].flatMap(() =>
            ['Academic AI', 'Student ID Auth', 'Faculty Reviews', 'Live USIS Data', 'CGPA Calculator', 'AI Resume', 'Mock Exams', 'Study Groups', 'Course Ratings', 'Campus Map'].map((t, i) => (
              <span key={t + i} style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {t}<span style={{ color: 'rgba(232,57,14,0.35)' }}>//</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '40px 16px 28px' : '56px 40px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: '24px', alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px' }}>
              // Welcome back, Student {studentId}
            </div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: isMobile ? '36px' : 'clamp(36px,4.5vw,56px)', letterSpacing: '2px', color: 'var(--paper)', lineHeight: 1 }}>
              BRACU COMMAND<br />DASHBOARD
            </div>
            <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '8px', letterSpacing: '.5px', lineHeight: 1.8 }}>
              Academic intelligence · Resource archive · AI tools · Community
            </div>
          </div>
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px 20px', textAlign: isMobile ? 'left' : 'right' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px' }}>USIS Seat Data</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isMobile ? 'flex-start' : 'flex-end', marginBottom: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--red)', letterSpacing: '1px' }}>LIVE CDN</span>
            </div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '26px', letterSpacing: '2px', color: 'var(--paper)' }}>
              00:{String(timer).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px' }}>Refreshes every 30 seconds</div>
          </div>
        </div>
      </div>

      {/* Tiles */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '28px 16px 0' : '40px 40px 0' }}>

        {/* Search */}
        <input
          style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none', marginBottom: '12px', letterSpacing: '.5px' }}
          placeholder="Search modules..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {CATEGORIES.map(c => (
            <button key={c}
              onClick={() => setCategory(c)}
              style={{ background: category === c ? 'var(--red)' : 'transparent', color: category === c ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${category === c ? 'var(--red)' : 'var(--border)'}`, padding: '7px 14px', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Tiles by category */}
        {CATEGORIES.filter(c => c !== 'All').map(cat => {
          const catTiles = filtered.filter(t => t.category === cat)
          if (catTiles.length === 0) return null
          const isSystem = cat === 'System'
          return (
            <div key={cat} style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cat}
                <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'inline-block' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isSystem ? cols2 : cols, gap: '2px', background: 'var(--border)' }}>
                {catTiles.map(t => (
                  <button
                    key={t.id}
                    onClick={() => router.push(`/${t.id}`)}
                    onMouseEnter={() => setHoveredTile(t.id)}
                    onMouseLeave={() => setHoveredTile(null)}
                    style={{ background: hoveredTile === t.id ? 'var(--ink2)' : 'var(--ink)', padding: isMobile ? '20px 16px' : '28px', cursor: 'crosshair', position: 'relative', overflow: 'hidden', transition: 'background .2s', display: 'flex', flexDirection: 'column', border: 'none', textAlign: 'left', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', width: '100%' }}>

                    {/* Bottom red line on hover */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'var(--red)', transform: hoveredTile === t.id ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform .3s' }} />

                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: isMobile ? '24px' : '32px', color: 'rgba(242,237,228,0.05)', letterSpacing: '2px', lineHeight: 1, marginBottom: '8px' }}>{t.num}</div>
                    <div style={{ fontSize: isMobile ? '20px' : '18px', marginBottom: '8px' }}>{t.icon}</div>
                    <div style={{ fontSize: isMobile ? '14px' : '13px', fontWeight: 700, color: 'var(--paper)', letterSpacing: '.3px', marginBottom: '6px' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, flex: 1 }}>{t.desc}</div>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginTop: '12px' }}>{t.tag}</div>
                    <div style={{ fontSize: '14px', color: 'var(--red)', marginTop: '8px', opacity: hoveredTile === t.id ? 1 : 0, transform: hoveredTile === t.id ? 'translateX(0)' : 'translateX(-6px)', transition: 'all .2s' }}>→</div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--faded)', fontSize: '12px', letterSpacing: '1px' }}>
            No modules found for "{search}"
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: '64px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'Bebas Neue,sans-serif', fontSize: isMobile ? '80px' : 'clamp(80px,14vw,180px)', color: 'rgba(242,237,228,0.016)', letterSpacing: '8px', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none' }}>COMMAND</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px' }}>// For every batch that comes after us</div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: isMobile ? '32px' : 'clamp(32px,4.5vw,56px)', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.05, marginBottom: '12px' }}>
              Be the senior<br />you never had.
            </div>
            <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 2, maxWidth: '360px', margin: '0 auto 28px' }}>
              Help grow BRACU Command — contribute resources, write reviews, share knowledge.
            </p>
            <button onClick={() => router.push('/resources')}
              style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink)', background: 'var(--paper)', border: 'none', padding: '14px 32px', cursor: 'crosshair', transition: 'all .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--red)', e.currentTarget.style.color = 'var(--paper)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--paper)', e.currentTarget.style.color = 'var(--ink)')}>
              Contribute Resources →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: isMobile ? '20px 16px' : '22px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '0', textAlign: isMobile ? 'center' : 'left' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '17px', letterSpacing: '3px' }}>BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD</div>
          <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'var(--dim)', marginTop: '4px', textTransform: 'uppercase' }}>Academic Intelligence System — v2.0</div>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', lineHeight: 1.8 }}>
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
        :root { --ink: #0C0B09; --ink2: #111009; --paper: #F2EDE4; --red: #E8390E; --faded: #6B5F4E; --dim: #2E2A23; --border: rgba(242,237,228,0.09); }
        body { background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        input::placeholder { color: rgba(107,95,78,0.45); font-size: 11px; }
      `}</style>
    </div>
  )
}