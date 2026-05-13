'use client'
import { useState, useEffect } from 'react'
import { getStudentId } from '@/lib/session'
import { useRouter } from 'next/navigation'


const TILES = [
  { id: 'resources', num: '01', icon: '📚', name: 'Resource Archive', desc: 'Past papers, notes, Drive links, YouTube — community rated.', tag: '// resource.cmd', status: 'live', category: 'Academic' },
  { id: 'faculty', num: '02', icon: '⭐', name: 'Faculty Intelligence', desc: 'Real BRACU faculty reviews — anonymous, verified students only.', tag: '// faculty.cmd', status: 'live', category: 'Academic' },
  { id: 'ai', num: '03', icon: '🤖', name: 'AI Engine', desc: 'Ask anything academic — topics, past papers, assignments, routines.', tag: '// ai.cmd', status: 'live', category: 'Academic' },
  { id: 'usis', num: '04', icon: '🪑', name: 'Live USIS Seats', desc: 'Real-time course seat availability. Refreshes every 60 seconds.', tag: '// usis.live', status: 'live', category: 'Academic' },
  { id: 'routine', num: '05', icon: '🗓️', name: 'Routine Builder', desc: 'Build your routine with live USIS data. Conflict detection included.', tag: '// routine.builder', status: 'live', category: 'Academic' },
  { id: 'cgpa', num: '06', icon: '📊', name: 'CGPA Calculator', desc: 'Enter your grades and get your CGPA instantly.', tag: '// cgpa.cmd', status: 'live', category: 'Academic' },
  { id: 'credits', num: '07', icon: '🎯', name: 'Credit Tracker', desc: 'Track credits done vs remaining. Know when you graduate.', tag: '// credits.cmd', status: 'live', category: 'Academic' },
  { id: 'planner', num: '08', icon: '📋', name: 'Course Planner', desc: 'Plan all semesters until graduation. Visual roadmap.', tag: '// planner.cmd', status: 'live', category: 'Academic' },
  { id: 'countdown', num: '09', icon: '📅', name: 'Exam Countdown', desc: 'Days left until midterm and final. Never miss a deadline.', tag: '// countdown.cmd', status: 'live', category: 'Academic' },
  { id: 'deadlines', num: '10', icon: '📝', name: 'Deadline Tracker', desc: 'Add assignment deadlines. Get reminders before they hit.', tag: '// deadlines.cmd', status: 'live', category: 'Academic' },
  { id: 'leaderboard', num: '11', icon: '🏆', name: 'Leaderboard', desc: 'Top resource contributors. Recognition for helping others.', tag: '// leaderboard.cmd', status: 'live', category: 'Community' },
  { id: 'confessions', num: '12', icon: '💬', name: 'Confession Board', desc: 'Anonymous BRACU student experiences and confessions.', tag: '// confess.cmd', status: 'live', category: 'Community' },
  { id: 'studygroups', num: '13', icon: '🤝', name: 'Study Groups', desc: 'Find students taking the same courses. Form study groups.', tag: '// groups.cmd', status: 'live', category: 'Community' },
  { id: 'noticeboard', num: '14', icon: '📣', name: 'Notice Board', desc: 'Important BRACU announcements and student notices.', tag: '// notices.cmd', status: 'live', category: 'Community' },
  { id: 'courserating', num: '15', icon: '🗳️', name: 'Course Ratings', desc: 'Rate courses not just faculty. Know what to expect.', tag: '// courses.cmd', status: 'live', category: 'Community' },
  { id: 'mentorship', num: '16', icon: '🗺️', name: 'Mentorship', desc: 'Senior roadmaps and direct mentorship via email or WhatsApp.', tag: '// mentor.cmd', status: 'live', category: 'Community' },
  { id: 'discussions', num: '17', icon: '💭', name: 'Discussions', desc: 'Course-specific Q&A. Answers from students who took it.', tag: '// discuss.cmd', status: 'live', category: 'Community' },
  { id: 'resume', num: '18', icon: '📄', name: 'AI Resume Builder', desc: 'AI builds your CV based on your courses and experience.', tag: '// resume.cmd', status: 'live', category: 'AI Tools' },
  { id: 'interview', num: '19', icon: '🎤', name: 'Interview Prep', desc: 'AI asks you real interview questions. Practice and improve.', tag: '// interview.cmd', status: 'live', category: 'AI Tools' },
  { id: 'flashcards', num: '20', icon: '📖', name: 'Flashcard Generator', desc: 'AI makes flashcards from your notes. Study smarter.', tag: '// flashcards.cmd', status: 'live', category: 'AI Tools' },
  { id: 'mockexam', num: '21', icon: '🧪', name: 'Mock Exam Generator', desc: 'AI creates practice exams from past papers. Exam-ready.', tag: '// mockexam.cmd', status: 'live', category: 'AI Tools' },
  { id: 'career', num: '22', icon: '💡', name: 'Career Path Advisor', desc: 'AI maps your career path based on courses and interests.', tag: '// career.cmd', status: 'live', category: 'AI Tools' },
  { id: 'map', num: '23', icon: '🗺️', name: 'Campus Map', desc: 'Interactive BRACU campus map. Find buildings and rooms.', tag: '// map.cmd', status: 'live', category: 'Utility' },
  { id: 'bus', num: '24', icon: '🚌', name: 'Bus Schedule', desc: 'BRACU bus timings and routes. Never miss your bus.', tag: '// bus.cmd', status: 'live', category: 'Utility' },
  { id: 'links', num: '25', icon: '🌐', name: 'Useful Links', desc: 'All important BRACU portals — USIS, email, library and more.', tag: '// links.cmd', status: 'live', category: 'Utility' },
  { id: 'security', num: '26', icon: '🔒', name: 'Security', desc: 'Full security architecture. Every layer explained.', tag: '// security.cmd', status: 'live', category: 'System' },
  { id: 'stack', num: '27', icon: '⚙️', name: 'Tech Stack', desc: 'Full technical architecture. $0/month. Built to scale.', tag: '// stack.cmd', status: 'live', category: 'System' },
]

const CATEGORIES = ['All', 'Academic', 'Community', 'AI Tools', 'Utility', 'System']

const BOTTOM_TABS = [
  { id: 'Academic', icon: '🎓', label: 'Academic' },
  { id: 'AI Tools', icon: '🤖', label: 'AI Tools' },
  { id: 'Community', icon: '👥', label: 'Community' },
  { id: 'Utility', icon: '🔧', label: 'Utility' },
  { id: 'System', icon: '⚙️', label: 'System' },
]

export default function Dashboard() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Academic')
  const [timer, setTimer] = useState(60)
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const id = getStudentId()
    if (!id) { router.push('/login'); return }
    setStudentId(id)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setTimer(p => p <= 0 ? 60 : p - 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = TILES.filter(t => {
    const matchCat = category === 'All' || t.category === category
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const catBtn = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--red)' : 'transparent',
    color: active ? 'var(--paper)' : 'var(--faded)',
    border: `1px solid ${active ? 'var(--red)' : 'var(--border)'}`,
    padding: '8px 14px', fontSize: '9px', letterSpacing: '1.5px',
    textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace',
    cursor: 'crosshair', transition: 'all .15s', whiteSpace: 'nowrap',
  })

  const tileStyle = (id: string): React.CSSProperties => ({
    background: hoveredTile === id ? 'var(--ink2)' : 'var(--ink)',
    padding: '28px', cursor: 'crosshair', position: 'relative',
    overflow: 'hidden', transition: 'background .2s', display: 'flex',
    flexDirection: 'column', border: 'none', textAlign: 'left',
    color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', width: '100%',
  })

  const mobileTileStyle = (id: string): React.CSSProperties => ({
    background: hoveredTile === id ? 'var(--ink2)' : 'var(--ink)',
    padding: '16px', cursor: 'crosshair', position: 'relative',
    overflow: 'hidden', transition: 'background .2s', display: 'flex',
    flexDirection: 'column', border: '1px solid var(--border)',
    borderRadius: '8px', textAlign: 'left',
    color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', width: '100%',
  })

  const s: { [key: string]: React.CSSProperties } = {
    page: { minHeight: '100vh', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace' },
    nav: { position: 'fixed', top: 0, left: 0, right: 0, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(12,11,9,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', zIndex: 500 },
    wrap: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' },
    hero: { padding: '80px 0 40px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'end' },
    h1: { fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(36px,4.5vw,56px)', letterSpacing: '2px', lineHeight: '1' },
    sub: { fontSize: '11px', color: 'var(--faded)', marginTop: '8px', letterSpacing: '.5px', lineHeight: '1.8' },
    seatBox: { background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px 20px', textAlign: 'right', minWidth: '180px' },
    searchBar: { display: 'flex', gap: '8px', margin: '28px 0 20px', alignItems: 'center' },
    searchInp: { flex: 1, background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none', letterSpacing: '.5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: 'transparent' } as React.CSSProperties,
    backTop: { position: 'fixed', bottom: '32px', right: '32px', background: 'var(--red)', color: 'var(--paper)', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'crosshair', zIndex: 400, transition: 'all .2s' },
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{ ...s.page, paddingBottom: '70px' }}>
        {/* Nav */}
        <nav style={{ ...s.nav, padding: '0 16px' }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', letterSpacing: '3px' }}>
            BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', marginLeft: '6px', verticalAlign: 'middle' }} />
            <span style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--faded)', marginLeft: '4px', verticalAlign: 'middle' }}>ONLINE</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', color: 'var(--faded)', border: '1px solid var(--border)', padding: '4px 8px' }}>ID: {studentId}</span>
            <button onClick={async () => { await fetch('/api/auth/session', { method: 'DELETE' }); router.push('/login') }}
              style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--faded)', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>
              SIGN OUT
            </button>
          </div>
        </nav>

        {/* Strip */}
        <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', padding: '10px 0', background: 'rgba(242,237,228,0.01)', marginTop: '52px' }}>
          <div style={{ display: 'flex', gap: '40px', animation: 'scroll 20s linear infinite', width: 'max-content' }}>
            {[...Array(2)].flatMap(() => ['Academic AI', 'Student ID Auth', 'Faculty Reviews', 'Live USIS Data', 'CGPA Calculator', 'AI Resume'].map((t, i) => (
              <span key={t + i} style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {t}<span style={{ color: 'rgba(0,180,255,0.3)' }}>//</span>
              </span>
            )))}
          </div>
        </div>

        {/* Mobile Hero */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '6px' }}>// WELCOME BACK, STUDENT {studentId}</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', letterSpacing: '2px', lineHeight: 1.1, color: 'var(--paper)' }}>BRACU<br />COMMAND</div>
            </div>
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '10px 12px', textAlign: 'center', minWidth: '110px' }}>
              <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '4px' }}>USIS SEAT DATA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginBottom: '2px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
                <span style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 700, letterSpacing: '1px' }}>LIVE CDN</span>
              </div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', letterSpacing: '2px', color: 'var(--paper)' }}>
                00:{String(timer).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '0.5px', marginTop: '2px' }}>Refreshes every 60s</div>
            </div>
          </div>

          {/* Mobile Search */}
          <div style={{ marginTop: '14px', background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--faded)', fontSize: '14px' }}>🔍</span>
            <input
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', outline: 'none' }}
              placeholder="Search modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile grid — 2 columns */}
        <div style={{ padding: '14px 12px' }}>
          {/* Category label */}
          <div style={{ fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {category}
            <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'inline-block' }} />
            <span style={{ color: 'var(--red)' }}>{filtered.length} modules</span>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px' }}>
              No modules found for "{search}"
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {filtered.map(t => (
              <button
                key={t.id}
                style={mobileTileStyle(t.id)}
                onClick={() => router.push(`/${t.id}`)}
                onMouseEnter={() => setHoveredTile(t.id)}
                onMouseLeave={() => setHoveredTile(null)}
              >
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{t.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '4px', lineHeight: 1.3 }}>{t.name}</div>
                <div style={{ fontSize: '9px', color: 'var(--faded)', lineHeight: 1.6, flex: 1 }}>{t.desc.substring(0, 50)}{t.desc.length > 50 ? '...' : ''}</div>
                <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--red)', marginTop: '8px' }}>{t.tag}</div>
              </button>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div style={{ padding: '40px 16px', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
          <div style={{ fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px' }}>// For every batch that comes after us</div>
          <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.1, marginBottom: '10px' }}>Be the senior<br />you never had.</div>
          <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9, marginBottom: '20px' }}>Help grow BRACU Command — contribute resources, write reviews, share knowledge.</p>
          <button onClick={() => router.push('/resources')}
            style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink)', background: 'var(--paper)', border: 'none', padding: '14px 28px', cursor: 'crosshair', width: '100%' }}>
            Contribute Resources →
          </button>
        </div>

        {/* Fixed Bottom Tab Bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--ink2)', borderTop: '1px solid var(--border)', display: 'flex', zIndex: 500, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {BOTTOM_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setCategory(tab.id); setSearch('') }}
              style={{ flex: 1, padding: '10px 4px 12px', background: 'none', border: 'none', cursor: 'crosshair', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderTop: category === tab.id ? '2px solid var(--red)' : '2px solid transparent', transition: 'all .15s' }}>
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span style={{ fontSize: '8px', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', color: category === tab.id ? 'var(--red)' : 'var(--faded)', fontWeight: category === tab.id ? 700 : 400 }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@1,700&display=swap');
          * { cursor: crosshair; box-sizing: border-box; margin: 0; padding: 0; }
          :root { --ink: #0A0E1A; --ink2: #0D1221; --paper: #E8F4FF; --red: #00B4FF; --faded: #4A7A9B; --dim: #1A2A3A; --bronze: #00D4FF; --border: rgba(0,180,255,0.15); }
          body { background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
          @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          input::placeholder { color: #4A7A9B; }
        `}</style>
      </div>
    )
  }

  // Desktop layout — unchanged
  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', letterSpacing: '4px' }}>
          BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />Online
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--faded)', border: '1px solid var(--border)', padding: '5px 12px' }}>
            ID: {studentId}
          </div>
          <button onClick={async () => { await fetch('/api/auth/session', { method: 'DELETE' }); router.push('/login') }}
            style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--faded)', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Strip */}
      <div style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)', padding: '12px 0', background: 'rgba(242,237,228,0.01)', marginTop: '52px' }}>
        <div style={{ display: 'flex', gap: '52px', animation: 'scroll 26s linear infinite', width: 'max-content' }}>
          {[...Array(2)].flatMap(() => ['Academic AI', 'Student ID Auth', 'Faculty Reviews', 'Live USIS Data', 'CGPA Calculator', 'AI Resume', 'Mock Exams', 'Study Groups', 'Course Ratings', 'Campus Map'].map((t, i) => (
            <span key={t + i} style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t}<span style={{ color: 'rgba(0,180,255,0.3)' }}>//</span>
            </span>
          )))}
        </div>
      </div>

      {/* Hero */}
      <div style={s.wrap}>
        <div style={s.hero}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px' }}>
              // Welcome back, Student {studentId}
            </div>
            <div style={s.h1}>BRACU COMMAND<br />DASHBOARD</div>
            <div style={s.sub}>Academic intelligence · Resource archive · AI tools · Community</div>
          </div>
          <div style={s.seatBox}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px' }}>USIS Seat Data</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--red)', letterSpacing: '1px' }}>LIVE CDN</span>
            </div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '26px', letterSpacing: '2px', color: 'var(--paper)' }}>
              00:{String(timer).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>Refreshes every 60 seconds</div>
          </div>
        </div>

        {/* Search + Filter */}
        <div style={s.searchBar}>
          <input style={s.searchInp} placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {CATEGORIES.map(c => (
            <button key={c} style={catBtn(category === c)} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {/* Tiles Grid */}
        {CATEGORIES.filter(c => c !== 'All').map(cat => {
          const catTiles = filtered.filter(t => t.category === cat)
          if (catTiles.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cat}
                <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'inline-block' }} />
              </div>
              <div style={s.grid}>
                {catTiles.map(t => (
                  <button key={t.id} style={tileStyle(t.id)} onClick={() => router.push(`/${t.id}`)} onMouseEnter={() => setHoveredTile(t.id)} onMouseLeave={() => setHoveredTile(null)}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'var(--red)', transform: hoveredTile === t.id ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform .3s' }} />
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'rgba(242,237,228,0.05)', letterSpacing: '2px', lineHeight: 1, marginBottom: '10px' }}>{t.num}</div>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>{t.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', letterSpacing: '.3px', marginBottom: '6px' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, flex: 1 }}>{t.desc}</div>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginTop: '12px' }}>{t.tag}</div>
                    <div style={{ fontSize: '14px', color: 'var(--red)', marginTop: '10px', opacity: hoveredTile === t.id ? 1 : 0, transition: 'all .2s' }}>→</div>
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
        <div style={{ padding: '72px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(80px,14vw,180px)', color: 'rgba(242,237,228,0.016)', letterSpacing: '8px', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none' }}>COMMAND</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px' }}>// For every batch that comes after us</div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.05, marginBottom: '12px' }}>Be the senior<br />you never had.</div>
            <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 2, maxWidth: '360px', margin: '0 auto 28px' }}>Help grow BRACU Command — contribute resources, write reviews, share knowledge.</p>
            <button onClick={() => router.push('/resources')} style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ink)', background: 'var(--paper)', border: 'none', padding: '14px 32px', cursor: 'crosshair' }}>
              Contribute Resources →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '22px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '17px', letterSpacing: '3px' }}>BRACU<span style={{ color: 'var(--red)' }}>/</span>CMD</div>
          <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: 'var(--dim)', marginTop: '4px', textTransform: 'uppercase' }}>Academic Intelligence System — v2.0</div>
        </div>
        <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textAlign: 'right', lineHeight: 1.8 }}>
          Built by a CSE student.<br />For every student that follows.
        </div>
      </footer>

      <button style={{ ...s.backTop, opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'all' : 'none' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { cursor: crosshair; box-sizing: border-box; margin: 0; padding: 0; }
        :root { --ink: #0A0E1A; --ink2: #0D1221; --paper: #E8F4FF; --red: #00B4FF; --faded: #4A7A9B; --dim: #1A2A3A; --bronze: #00D4FF; --border: rgba(0,180,255,0.15); }
        body { background: var(--ink); color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        input::placeholder { color: #4A7A9B; }
      `}</style>
    </div>
  )
}