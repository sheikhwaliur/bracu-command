'use client'
import { useState, useEffect } from 'react'
import { checkRateLimit } from '@/lib/rateLimit'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/layout/PageLayout'

interface Confession {
  id: string
  text: string
  category: string
  likes: number
  time: string
  liked?: boolean
}

const CATEGORIES = ['All', 'Academic', 'Social', 'Faculty', 'Career', 'Mental Health', 'Random']

const CAT_COLOR: Record<string, string> = {
  Academic: 'var(--red)',
  Social: 'var(--bronze)',
  Faculty: '#5fd49a',
  Career: '#64b4ff',
  'Mental Health': '#c084fc',
  Random: 'var(--faded)',
}

const MOCK: Confession[] = [
  { id: '1', text: 'I have been copying assignments since semester 2 and somehow got a 3.8 CGPA. The system is broken.', category: 'Academic', likes: 234, time: '2 hours ago' },
  { id: '2', text: 'Failed CSE221 twice. Now I am a TA for it. Life is weird.', category: 'Academic', likes: 412, time: '5 hours ago' },
  { id: '3', text: 'My mental health completely broke down in semester 5. Nobody warned me it would be this hard. If you are struggling, please talk to someone.', category: 'Mental Health', likes: 567, time: '1 day ago' },
  { id: '4', text: 'I genuinely do not understand why we need to take SOC101. I am a CSE student.', category: 'Academic', likes: 891, time: '3 hours ago' },
  { id: '5', text: 'Got rejected from 15 companies before landing my first internship. Do not give up.', category: 'Career', likes: 743, time: '6 hours ago' },
  { id: '6', text: 'I cry before every final exam. I thought I was alone until my roommate told me she does too.', category: 'Mental Health', likes: 389, time: '12 hours ago' },
  { id: '7', text: 'One professor changed my life. Another almost made me drop out. The gap between BRACU teachers is insane.', category: 'Faculty', likes: 521, time: '2 days ago' },
  { id: '8', text: 'I spent 3 semesters trying to impress everyone else. Semester 7 I finally started studying for myself. My GPA went up 0.4.', category: 'Academic', likes: 298, time: '1 day ago' },
  { id: '9', text: 'BRACU cafeteria food has gotten so bad I genuinely miss my mom\'s cooking for the first time in my life.', category: 'Random', likes: 667, time: '4 hours ago' },
  { id: '10', text: 'I am in semester 8 and still have no idea what I want to do after graduation. And that is okay.', category: 'Career', likes: 445, time: '8 hours ago' },
]

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>(MOCK)
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<'latest' | 'top'>('top')
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [cat, setCat] = useState('Academic')
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})
  const [charCount, setCharCount] = useState(0)
  const MAX = 500

  useEffect(() => {
    const saved = localStorage.getItem('bracu_liked_confessions')
    if (saved) setLikedIds(JSON.parse(saved))
  
    const fetchConfessions = async () => {
      const { data } = await supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setConfessions(p => [
          ...data.map((c: any) => ({
            id: c.id,
            text: c.text,
            category: c.category,
            likes: c.likes || 0,
            time: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          })),
          ...p,
        ])
      }
    }
    fetchConfessions()
  }, [])

  const like = async (id: string) => {
    if (likedIds[id]) return
    const newLiked = { ...likedIds, [id]: true }
    setLikedIds(newLiked)
    localStorage.setItem('bracu_liked_confessions', JSON.stringify(newLiked))
    setConfessions(p => p.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c))
    await supabase.from('confessions').update({ likes: (confessions.find(c => c.id === id)?.likes || 0) + 1 }).eq('id', id)
  }

  const [err, setErr] = useState('') 

  const submit = async () => {
    // ✅ ADD THESE 3 LINES
    const { allowed, waitSeconds } = checkRateLimit({ key: 'confession', limitMs: 300000, maxAttempts: 3 })
    if (!allowed) { setErr(`Please wait ${waitSeconds} seconds before posting again.`); return }
  
    // YOUR EXISTING CODE UNCHANGED BELOW
    if (!text.trim() || text.length < 10) return
    const { data, error } = await supabase
      .from('confessions')
      .insert({ text: text.trim(), category: cat, likes: 0 })
      .select()
      .single()
    if (error) { console.error(error); return }
    setConfessions(p => [{
      id: data.id, text: data.text, category: data.category,
      likes: 0, time: 'Just now',
    }, ...p])
    setText('')
    setCharCount(0)
    setShowForm(false)
  }

  const filtered = confessions
    .filter(c => category === 'All' || c.category === category)
    .sort((a, b) => sort === 'top' ? b.likes - a.likes : b.id.localeCompare(a.id))

  return (
    <PageLayout
      eyebrow="Confession Board"
      title="Say what you<br/>can't say out loud."
      subtitle="Completely anonymous. No Student ID shown. No tracking. Just honest BRACU student experiences."
    >
      {/* Anonymous notice */}
      <div style={{ background: 'rgba(95,212,154,0.06)', border: '1px solid rgba(95,212,154,0.2)', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '16px' }}>🔒</span>
        <div style={{ fontSize: '11px', color: 'var(--faded)', letterSpacing: '.3px', lineHeight: 1.7 }}>
          <strong style={{ color: '#5fd49a' }}>100% Anonymous.</strong> Your Student ID is never stored or shown. No one can trace confessions back to you.
          <span style={{ color: 'var(--dim)', marginLeft: '8px' }}>· Be kind. Be honest. Support each other.</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['top', 'latest'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              style={{ padding: '8px 16px', background: sort === s ? 'var(--red)' : 'transparent', color: sort === s ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${sort === s ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
              {s === 'top' ? '🔥 Top' : '🕐 Latest'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '9px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', marginLeft: 'auto' }}>
          + Confess
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{ padding: '6px 14px', background: category === c ? (CAT_COLOR[c] || 'var(--red)') : 'transparent', color: category === c ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${category === c ? (CAT_COLOR[c] || 'var(--red)') : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s', opacity: category === c ? 1 : 0.7 }}>
            {c}
          </button>
        ))}
      </div>

      {/* Confession form */}
      {showForm && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '6px', fontWeight: 700 }}>// Anonymous Confession</div>
          <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '16px', letterSpacing: '.3px' }}>Your Student ID is never stored or associated with this post.</div>

          <div style={{ marginBottom: '12px' }}>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setCharCount(e.target.value.length) }}
              placeholder="Share your honest experience, thought, or confession..."
              maxLength={MAX}
              rows={5}
              style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '14px', outline: 'none', resize: 'none', lineHeight: 1.8, letterSpacing: '.3px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px', color: charCount > MAX * 0.8 ? 'var(--red)' : 'var(--faded)', letterSpacing: '1px' }}>
              <span>Min 10 characters</span>
              <span>{charCount}/{MAX}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Category</label>
              <select value={cat} onChange={e => setCat(e.target.value)}
                style={{ background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none' }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {err && <div style={{ color: 'var(--red)', fontSize: '11px', marginBottom: '8px' }}>{err}</div>}
            <button onClick={submit} disabled={text.length < 10}
              style={{ background: text.length >= 10 ? 'var(--paper)' : 'var(--dim)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: text.length >= 10 ? 'crosshair' : 'not-allowed', marginTop: '20px', transition: 'all .15s' }}>
              Post Anonymously →
            </button>
          </div>

          <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(242,237,228,0.02)', border: '1px solid var(--border)', fontSize: '10px', color: 'var(--dim)', lineHeight: 1.8 }}>
            ⚠️ No hate speech, harassment, or personal attacks. Posts violating community guidelines will be removed. Be honest, be kind.
          </div>
        </div>
      )}

      {/* Confessions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)', letterSpacing: '1px' }}>
            No confessions in this category yet. Be the first.
          </div>
        )}
        {filtered.map((c, i) => (
          <div key={c.id}
            style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              {/* Rank number */}
              {sort === 'top' && i < 3 && (
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: i === 0 ? '#FFD700' : i === 1 ? 'rgba(192,192,192,0.6)' : 'var(--bronze)', letterSpacing: '1px', lineHeight: 1, flexShrink: 0 }}>
                  {i + 1}
                </div>
              )}

              <div style={{ flex: 1 }}>
                {/* Category tag */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: CAT_COLOR[c.category] || 'var(--faded)', border: `1px solid ${CAT_COLOR[c.category] || 'var(--border)'}`, padding: '2px 8px', opacity: .85 }}>{c.category}</span>
                  <span style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px' }}>{c.time}</span>
                  <span style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px', marginLeft: 'auto' }}>Anonymous Student</span>
                </div>

                {/* Confession text */}
                <p style={{ fontSize: '13px', color: 'var(--paper)', lineHeight: 1.85, letterSpacing: '.2px', fontStyle: 'normal' }}>{c.text}</p>
              </div>
            </div>

            {/* Like button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => like(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: likedIds[c.id] ? 'rgba(232,57,14,0.1)' : 'none', border: `1px solid ${likedIds[c.id] ? 'rgba(232,57,14,0.3)' : 'var(--border)'}`, color: likedIds[c.id] ? 'var(--red)' : 'var(--faded)', padding: '6px 14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '1px', cursor: likedIds[c.id] ? 'default' : 'crosshair', transition: 'all .15s' }}>
                <span>{likedIds[c.id] ? '❤️' : '🤍'}</span>
                <span>{c.likes}</span>
                <span style={{ fontSize: '9px' }}>{likedIds[c.id] ? 'Felt this' : 'Relate'}</span>
              </button>
              <span style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px' }}>
                {c.likes > 100 ? '🔥 Trending' : c.likes > 50 ? '⚡ Popular' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Total Confessions', val: confessions.length },
          { label: 'Total Relates', val: confessions.reduce((a, c) => a + c.likes, 0) },
          { label: 'Categories', val: CATEGORIES.length - 1 },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}