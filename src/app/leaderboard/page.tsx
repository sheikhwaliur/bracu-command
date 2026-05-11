'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Contributor {
  id: string
  studentId: string
  dept: string
  semester: string
  resources: number
  reviews: number
  discussions: number
  upvotes: number
  score: number
  badge: string
  joinedSem: string
}

const BADGES: Record<string, { icon: string; label: string; color: string }> = {
  legend: { icon: '👑', label: 'Legend', color: '#FFD700' },
  elite: { icon: '⚡', label: 'Elite', color: 'var(--red)' },
  senior: { icon: '🎯', label: 'Senior', color: 'var(--bronze)' },
  active: { icon: '🔥', label: 'Active', color: '#ff6b6b' },
  rising: { icon: '🌟', label: 'Rising Star', color: '#5fd49a' },
  new: { icon: '🆕', label: 'New', color: 'var(--faded)' },
}

const MOCK_LEADERS: Contributor[] = [
  { id: '1', studentId: '19301***', dept: 'CSE', semester: '10', resources: 47, reviews: 23, discussions: 89, upvotes: 312, score: 1240, badge: 'legend', joinedSem: 'Spring 2022' },
  { id: '2', studentId: '20201***', dept: 'CSE', semester: '8', resources: 31, reviews: 18, discussions: 54, upvotes: 218, score: 890, badge: 'elite', joinedSem: 'Fall 2022' },
  { id: '3', studentId: '21301***', dept: 'EEE', semester: '7', resources: 28, reviews: 15, discussions: 41, upvotes: 187, score: 742, badge: 'elite', joinedSem: 'Spring 2023' },
  { id: '4', studentId: '20401***', dept: 'CSE', semester: '9', resources: 22, reviews: 31, discussions: 28, upvotes: 156, score: 698, badge: 'senior', joinedSem: 'Fall 2022' },
  { id: '5', studentId: '21201***', dept: 'BBA', semester: '6', resources: 19, reviews: 12, discussions: 67, upvotes: 143, score: 634, badge: 'senior', joinedSem: 'Spring 2023' },
  { id: '6', studentId: '22301***', dept: 'CSE', semester: '5', resources: 15, reviews: 8, discussions: 43, upvotes: 98, score: 421, badge: 'active', joinedSem: 'Fall 2023' },
  { id: '7', studentId: '22101***', dept: 'PHR', semester: '5', resources: 12, reviews: 19, discussions: 31, upvotes: 87, score: 387, badge: 'active', joinedSem: 'Spring 2024' },
  { id: '8', studentId: '23201***', dept: 'CSE', semester: '3', resources: 8, reviews: 6, discussions: 22, upvotes: 54, score: 234, badge: 'rising', joinedSem: 'Fall 2024' },
  { id: '9', studentId: '23101***', dept: 'EEE', semester: '3', resources: 6, reviews: 9, discussions: 18, upvotes: 43, score: 198, badge: 'rising', joinedSem: 'Spring 2025' },
  { id: '10', studentId: '24301***', dept: 'CSE', semester: '1', resources: 3, reviews: 2, discussions: 8, upvotes: 21, score: 87, badge: 'new', joinedSem: 'Fall 2025' },
]

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'overall' | 'resources' | 'reviews' | 'discussions'>('overall')
  const [dept, setDept] = useState('All')
  const [studentId, setStudentId] = useState('')
  const [myRank, setMyRank] = useState<Contributor | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('bracu_student_id') || ''
    setStudentId(id)
    // Simulate finding student in leaderboard
    setMyRank({
      id: 'me', studentId: id.substring(0, 5) + '***', dept: 'CSE', semester: '8',
      resources: 5, reviews: 3, discussions: 12, upvotes: 34, score: 156, badge: 'rising', joinedSem: 'Spring 2024'
    })
  }, [])

  const depts = ['All', 'CSE', 'EEE', 'BBA', 'PHR', 'ECO']

  const sorted = [...MOCK_LEADERS]
    .filter(l => dept === 'All' || l.dept === dept)
    .sort((a, b) => {
      if (tab === 'resources') return b.resources - a.resources
      if (tab === 'reviews') return b.reviews - a.reviews
      if (tab === 'discussions') return b.discussions - a.discussions
      return b.score - a.score
    })

  const getVal = (l: Contributor) => {
    if (tab === 'resources') return l.resources
    if (tab === 'reviews') return l.reviews
    if (tab === 'discussions') return l.discussions
    return l.score
  }

  const getValLabel = () => {
    if (tab === 'resources') return 'resources'
    if (tab === 'reviews') return 'reviews'
    if (tab === 'discussions') return 'answers'
    return 'points'
  }

  const rankMedal = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  return (
    <PageLayout
      eyebrow="Leaderboard"
      title="Top contributors.<br/>Real recognition."
      subtitle="Students who help the most — uploading resources, writing reviews, answering questions. Ranked by impact."
    >
      {/* My rank card */}
      {myRank && (
        <div style={{ background: 'rgba(232,57,14,0.06)', border: '1px solid rgba(232,57,14,0.2)', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', fontWeight: 700 }}>// YOUR RANK</div>
          <div style={{ flex: 1, display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--paper)', letterSpacing: '1px' }}>{MOCK_LEADERS.length + 1}</div>
              <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>Rank</div>
            </div>
            {[
              { label: 'Resources', val: myRank.resources },
              { label: 'Reviews', val: myRank.reviews },
              { label: 'Answers', val: myRank.discussions },
              { label: 'Points', val: myRank.score },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--faded)', letterSpacing: '.5px', textAlign: 'right' }}>
            Contribute more to climb the ranks →<br />
            <span style={{ fontSize: '9px', color: 'var(--dim)' }}>Upload resources, write reviews, answer questions</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Tab */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {([['overall', '🏆 Overall'], ['resources', '📚 Resources'], ['reviews', '⭐ Reviews'], ['discussions', '💬 Answers']] as const).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 14px', background: tab === t ? 'var(--red)' : 'transparent', color: tab === t ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${tab === t ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Dept filter */}
        <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
          {depts.map(d => (
            <button key={d} onClick={() => setDept(d)}
              style={{ padding: '7px 12px', background: dept === d ? 'var(--ink2)' : 'transparent', color: dept === d ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${dept === d ? 'var(--border)' : 'transparent'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', marginBottom: '2px', background: 'var(--border)' }}>
          {/* 2nd place */}
          <div style={{ background: 'var(--ink2)', padding: '24px 20px', textAlign: 'center', order: 1 }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥈</div>
            <div style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '1px', marginBottom: '4px' }}>{sorted[1].dept} · Sem {sorted[1].semester}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '4px' }}>{sorted[1].studentId}</div>
            <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '8px' }}>{BADGES[sorted[1].badge].icon} {BADGES[sorted[1].badge].label}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--bronze)', letterSpacing: '2px' }}>{getVal(sorted[1])}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{getValLabel()}</div>
          </div>

          {/* 1st place */}
          <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.2)', padding: '28px 20px', textAlign: 'center', order: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg,transparent,#FFD700,transparent)' }} />
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🥇</div>
            <div style={{ fontSize: '10px', color: '#FFD700', letterSpacing: '1px', marginBottom: '4px' }}>{sorted[0].dept} · Sem {sorted[0].semester}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '4px' }}>{sorted[0].studentId}</div>
            <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '8px' }}>{BADGES[sorted[0].badge].icon} {BADGES[sorted[0].badge].label}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '40px', color: '#FFD700', letterSpacing: '2px' }}>{getVal(sorted[0])}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{getValLabel()}</div>
          </div>

          {/* 3rd place */}
          <div style={{ background: 'var(--ink2)', padding: '24px 20px', textAlign: 'center', order: 3 }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥉</div>
            <div style={{ fontSize: '10px', color: 'var(--bronze)', letterSpacing: '1px', marginBottom: '4px' }}>{sorted[2].dept} · Sem {sorted[2].semester}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '4px' }}>{sorted[2].studentId}</div>
            <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '8px' }}>{BADGES[sorted[2].badge].icon} {BADGES[sorted[2].badge].label}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--bronze)', letterSpacing: '2px' }}>{getVal(sorted[2])}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{getValLabel()}</div>
          </div>
        </div>
      )}

      {/* Full leaderboard table */}
      <div style={{ border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 80px 80px 100px', gap: '0', padding: '10px 16px', background: 'var(--ink2)', borderBottom: '1px solid var(--border)' }}>
          {['#', 'Student', 'Resources', 'Reviews', 'Answers', 'Upvotes', 'Points'].map((h, i) => (
            <div key={i} style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700, textAlign: i > 1 ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>

        {sorted.map((l, i) => (
          <div key={l.id}
            style={{ display: 'grid', gridTemplateColumns: '48px 1fr 80px 80px 80px 80px 100px', gap: '0', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--ink)', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

            {/* Rank */}
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: i < 3 ? '20px' : '16px', color: i === 0 ? '#FFD700' : i === 1 ? 'rgba(192,192,192,0.8)' : i === 2 ? 'var(--bronze)' : 'var(--faded)', alignSelf: 'center' }}>
              {rankMedal(i)}
            </div>

            {/* Student info */}
            <div style={{ alignSelf: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: 'var(--paper)', letterSpacing: '1px' }}>{l.studentId}</span>
                <span style={{ fontSize: '11px' }}>{BADGES[l.badge].icon}</span>
                <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: BADGES[l.badge].color, border: `1px solid ${BADGES[l.badge].color}`, padding: '1px 6px', opacity: 0.8 }}>{BADGES[l.badge].label}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '.5px' }}>{l.dept} · Semester {l.semester} · Joined {l.joinedSem}</div>
            </div>

            {/* Stats */}
            {[l.resources, l.reviews, l.discussions, l.upvotes].map((v, j) => (
              <div key={j} style={{ textAlign: 'center', alignSelf: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: tab !== 'overall' && j === ['resources', 'reviews', 'discussions'].indexOf(tab) ? 'var(--red)' : 'var(--paper)', letterSpacing: '1px' }}>{v}</div>
              </div>
            ))}

            {/* Score */}
            <div style={{ textAlign: 'center', alignSelf: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)', letterSpacing: '1px' }}>{l.score}</div>
              <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>pts</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring system */}
      <div style={{ marginTop: '24px', background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>HOW POINTS WORK</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          {[
            { action: 'Upload resource', points: '+10 pts', icon: '📚' },
            { action: 'Resource rated 5★', points: '+5 pts', icon: '⭐' },
            { action: 'Write faculty review', points: '+8 pts', icon: '✍️' },
            { action: 'Answer a question', points: '+6 pts', icon: '💬' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '11px', color: 'var(--faded)', marginBottom: '4px', lineHeight: 1.5 }}>{s.action}</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: '#5fd49a', letterSpacing: '1px' }}>{s.points}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}