'use client'
import { useState, useEffect } from 'react'
import { getStudentId } from '@/lib/session'
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
  const [tab, setTab] = useState<'overall'|'resources'|'reviews'|'discussions'>('overall')
  const [dept, setDept] = useState('All')
  const [studentId, setStudentId] = useState('')

  useEffect(() => {
    const id = getStudentId()
    setStudentId(id)
  }, [])

  const depts = ['All','CSE','EEE','BBA','PHR','ECO']

  const sorted = [...MOCK_LEADERS]
    .filter(l => dept==='All'||l.dept===dept)
    .sort((a,b) => {
      if (tab==='resources') return b.resources-a.resources
      if (tab==='reviews') return b.reviews-a.reviews
      if (tab==='discussions') return b.discussions-a.discussions
      return b.score-a.score
    })

  const getVal = (l: Contributor) => {
    if (tab==='resources') return l.resources
    if (tab==='reviews') return l.reviews
    if (tab==='discussions') return l.discussions
    return l.score
  }

  const getValLabel = () => tab==='resources'?'resources':tab==='reviews'?'reviews':tab==='discussions'?'answers':'points'

  const rankMedal = (i: number) => i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`

  return (
    <PageLayout eyebrow="Leaderboard" title="Top contributors.<br/>Real recognition." subtitle="Students who help the most — ranked by impact.">

      <style>{`
        .lb-tabs { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; margin-bottom: 14px; }
        .lb-tabs button { flex-shrink: 0; }
        .lb-row { display: grid; grid-template-columns: 44px 1fr 60px; gap: 8px; align-items: center; }
        .lb-stats { display: none; }
        @media(min-width:640px) {
          .lb-row { grid-template-columns: 44px 1fr 70px 70px 70px 80px !important; }
          .lb-stats { display: contents !important; }
        }
      `}</style>

      {/* My rank */}
      <div style={{ background: 'rgba(232,57,14,0.06)', border: '1px solid rgba(232,57,14,0.2)', padding: '16px 20px', marginBottom: '20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', fontWeight: 700, marginBottom: '12px' }}>// YOUR RANK</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Rank', val: MOCK_LEADERS.length+1 },
            { label: 'Resources', val: 5 },
            { label: 'Reviews', val: 3 },
            { label: 'Points', val: 156 },
          ].map((s,i)=>(
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '26px', color: i===0?'var(--paper)':'var(--red)', letterSpacing: '1px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab filter */}
      <div className="lb-tabs">
        {([['overall','🏆 Overall'],['resources','📚 Resources'],['reviews','⭐ Reviews'],['discussions','💬 Answers']] as const).map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding: '8px 14px', background: tab===t?'var(--red)':'transparent', color: tab===t?'var(--paper)':'var(--faded)', border: `1px solid ${tab===t?'var(--red)':'var(--border)'}`, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Dept filter */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {depts.map(d=>(
          <button key={d} onClick={()=>setDept(d)}
            style={{ padding: '6px 12px', background: dept===d?'var(--ink2)':'transparent', color: dept===d?'var(--paper)':'var(--faded)', border: `1px solid ${dept===d?'var(--border)':'transparent'}`, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {d}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {sorted.length>=3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', marginBottom: '2px', background: 'var(--border)' }}>
          {[sorted[1], sorted[0], sorted[2]].map((l,i)=>{
            const rank = i===1?0:i===0?1:2
            const medal = rank===0?'🥇':rank===1?'🥈':'🥉'
            const isFirst = rank===0
            return (
              <div key={l.id} style={{ background: isFirst?'rgba(232,57,14,0.08)':'var(--ink2)', padding: isFirst?'24px 16px':'20px 16px', textAlign: 'center', border: isFirst?'1px solid rgba(232,57,14,0.2)':'none', position: 'relative' }}>
                {isFirst && <div style={{ position: 'absolute', top: '-1px', left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg,transparent,#FFD700,transparent)' }} />}
                <div style={{ fontSize: isFirst?'28px':'22px', marginBottom: '6px' }}>{medal}</div>
                <div style={{ fontSize: '9px', color: isFirst?'#FFD700':'var(--bronze)', letterSpacing: '1px', marginBottom: '3px' }}>{l.dept} · S{l.semester}</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: isFirst?'18px':'16px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '3px' }}>{l.studentId}</div>
                <div style={{ fontSize: '9px', color: 'var(--faded)', marginBottom: '6px' }}>{BADGES[l.badge].icon} {BADGES[l.badge].label}</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: isFirst?'32px':'26px', color: isFirst?'#FFD700':'var(--bronze)', letterSpacing: '2px' }}>{getVal(l)}</div>
                <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{getValLabel()}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full leaderboard */}
      <div style={{ border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="lb-row" style={{ padding: '10px 14px', background: 'var(--ink2)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}>#</div>
          <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}>Student</div>
          <div className="lb-stats" style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700, textAlign: 'center' }}>Res</div>
          <div className="lb-stats" style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700, textAlign: 'center' }}>Rev</div>
          <div className="lb-stats" style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700, textAlign: 'center' }}>Ans</div>
          <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700, textAlign: 'center' }}>Pts</div>
        </div>

        {sorted.map((l,i)=>(
          <div key={l.id} className="lb-row"
            style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--ink)', transition: 'background .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='var(--ink2)')}
            onMouseLeave={e=>(e.currentTarget.style.background='var(--ink)')}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: i<3?'18px':'14px', color: i===0?'#FFD700':i===1?'rgba(192,192,192,0.8)':i===2?'var(--bronze)':'var(--faded)' }}>
              {rankMedal(i)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--paper)', letterSpacing: '1px' }}>{l.studentId}</span>
                <span style={{ fontSize: '11px' }}>{BADGES[l.badge].icon}</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '.5px' }}>{l.dept} · Sem {l.semester}</div>
            </div>
            <div className="lb-stats" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--paper)', letterSpacing: '1px' }}>{l.resources}</div>
            </div>
            <div className="lb-stats" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--paper)', letterSpacing: '1px' }}>{l.reviews}</div>
            </div>
            <div className="lb-stats" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--paper)', letterSpacing: '1px' }}>{l.discussions}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--red)', letterSpacing: '1px' }}>{l.score}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring */}
      <div style={{ marginTop: '20px', background: 'var(--ink2)', border: '1px solid var(--border)', padding: '18px 20px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', fontWeight: 700 }}>HOW POINTS WORK</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
          {[
            { action: 'Upload resource', points: '+10 pts', icon: '📚' },
            { action: 'Resource rated 5★', points: '+5 pts', icon: '⭐' },
            { action: 'Write faculty review', points: '+8 pts', icon: '✍️' },
            { action: 'Answer a question', points: '+6 pts', icon: '💬' },
          ].map((s,i)=>(
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--ink)', border: '1px solid var(--border)', alignItems: 'center' }}>
              <span style={{ fontSize: '16px' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.5 }}>{s.action}</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: '#5fd49a', letterSpacing: '1px' }}>{s.points}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}