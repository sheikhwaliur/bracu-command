'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/layout/PageLayout'

interface Resource {
  id: string
  title: string
  type: 'drive' | 'onedrive' | 'youtube' | 'pdf'
  course: string
  semester: string
  link: string
  contributed_by: string
  ratings: number[]
  avg_rating: number
  bookmarked?: boolean
}

const MOCK_RESOURCES: Resource[] = [
  { id: '1', type: 'pdf', title: 'CSE471 Final — Spring 2024', course: 'CSE471', semester: 'Spring 2024', link: '#', contributed_by: 'Anonymous', ratings: [5,5,4,5], avg_rating: 4.8 },
  { id: '2', type: 'drive', title: 'CSE482 Mid + Final Package', course: 'CSE482', semester: 'Fall 2023', link: '#', contributed_by: 'Anonymous', ratings: [4,5,4,3], avg_rating: 4.0 },
  { id: '3', type: 'drive', title: 'MAT215 Midterm 2019–2024', course: 'MAT215', semester: 'Multiple', link: '#', contributed_by: 'Anonymous', ratings: [5,5,5,4], avg_rating: 4.8 },
  { id: '4', type: 'youtube', title: 'Data Structures Full Course — Abdul Bari', course: 'CSE220', semester: 'Any', link: 'https://youtube.com/watch?v=RBSGKlAvoiM', contributed_by: 'Anonymous', ratings: [5,5,5,5], avg_rating: 5.0 },
  { id: '5', type: 'youtube', title: 'OS Full Course — Neso Academy', course: 'CSE341', semester: 'Any', link: 'https://youtube.com/watch?v=vBURTt97EkA', contributed_by: 'Anonymous', ratings: [5,5,4,5], avg_rating: 4.8 },
  { id: '6', type: 'onedrive', title: 'CSE220 Complete Notes', course: 'CSE220', semester: 'Spring 2024', link: '#', contributed_by: 'Anonymous', ratings: [4,4,5,4], avg_rating: 4.3 },
  { id: '7', type: 'pdf', title: 'CSE423 Past Papers Bundle', course: 'CSE423', semester: '2021–2024', link: '#', contributed_by: 'Anonymous', ratings: [4,5,4,3], avg_rating: 4.0 },
  { id: '8', type: 'youtube', title: 'Networks Full Course — Gate Smashers', course: 'CSE471', semester: 'Any', link: 'https://youtube.com/watch?v=JFF2vAaN6Qs', contributed_by: 'Anonymous', ratings: [4,4,5,4], avg_rating: 4.3 },
]

const TYPE_ICON: Record<string, string> = { pdf: '📄', drive: '🔗', onedrive: '☁️', youtube: '🎥' }
const TYPE_LABEL: Record<string, string> = { pdf: 'PDF', drive: 'Google Drive', onedrive: 'OneDrive', youtube: 'YouTube' }

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES)
  const [tab, setTab] = useState<'all' | 'pdf' | 'drive' | 'onedrive' | 'youtube'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'rating' | 'newest'>('rating')
  const [showContribute, setShowContribute] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [ratedIds, setRatedIds] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({ title: '', course: '', semester: '', link: '', type: 'drive' as Resource['type'] })
  const [studentId, setStudentId] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('bracu_student_id') || ''
    setStudentId(id)
    const saved = localStorage.getItem('bracu_bookmarks')
    if (saved) setBookmarks(JSON.parse(saved))
    const rated = localStorage.getItem('bracu_rated_resources')
    if (rated) setRatedIds(JSON.parse(rated))
  }, [])

  const rate = (id: string, val: number) => {
    if (ratedIds[id]) return
    const newRated = { ...ratedIds, [id]: true }
    setRatedIds(newRated)
    localStorage.setItem('bracu_rated_resources', JSON.stringify(newRated))
    setResources(p => p.map(r => {
      if (r.id !== id) return r
      const newRatings = [...r.ratings, val]
      return { ...r, ratings: newRatings, avg_rating: parseFloat((newRatings.reduce((a, b) => a + b, 0) / newRatings.length).toFixed(1)) }
    }))
  }

  const toggleBookmark = (id: string) => {
    const newBm = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id]
    setBookmarks(newBm)
    localStorage.setItem('bracu_bookmarks', JSON.stringify(newBm))
  }

  const contribute = () => {
    if (!form.title || !form.course || !form.link) return
    const newRes: Resource = {
      id: Date.now().toString(),
      type: form.type,
      title: form.title,
      course: form.course.toUpperCase(),
      semester: form.semester || 'Any',
      link: form.link,
      contributed_by: 'Anonymous',
      ratings: [],
      avg_rating: 0,
    }
    setResources(p => [newRes, ...p])
    setForm({ title: '', course: '', semester: '', link: '', type: 'drive' })
    setShowContribute(false)
  }

  const filtered = resources
    .filter(r => tab === 'all' || r.type === tab)
    .filter(r => !showBookmarks || bookmarks.includes(r.id))
    .filter(r => !search || (r.title + r.course + r.semester).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'rating' ? b.avg_rating - a.avg_rating : parseInt(b.id) - parseInt(a.id))

  const inp: React.CSSProperties = { width: '100%', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 14px', outline: 'none', letterSpacing: '.3px' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '7px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Academic Resource Archive"
      title="Every resource.<br/>One place."
      subtitle="Drive links, OneDrive, YouTube, PDFs — indexed by course. Community-rated. Sorted by most preferred."
    >
      {/* Top bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none' }}
          placeholder="Search by title, course code, semester..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 14px', outline: 'none' }}
        >
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
        <button
          onClick={() => setShowBookmarks(p => !p)}
          style={{ background: showBookmarks ? 'var(--bronze)' : 'transparent', color: showBookmarks ? 'var(--paper)' : 'var(--faded)', border: '1px solid var(--border)', padding: '10px 16px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}
        >
          📌 Saved ({bookmarks.length})
        </button>
        <button
          onClick={() => setShowContribute(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '10px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}
        >
          + Contribute
        </button>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', background: 'var(--border)' }}>
        {(['all', 'pdf', 'drive', 'onedrive', 'youtube'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '11px', background: tab === t ? 'var(--ink2)' : 'var(--ink)', color: tab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', borderBottom: tab === t ? '1px solid var(--red)' : '1px solid transparent', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {t === 'all' ? 'All' : TYPE_ICON[t] + ' ' + TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Contribute form */}
      {showContribute && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '20px', fontWeight: 700 }}>// Contribute Resource</div>

          {/* Type selector */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
            {(['drive', 'onedrive', 'youtube', 'pdf'] as const).map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                style={{ flex: 1, padding: '8px', background: form.type === t ? 'rgba(232,57,14,0.1)' : 'transparent', color: form.type === t ? 'var(--red)' : 'var(--faded)', border: `1px solid ${form.type === t ? 'rgba(232,57,14,0.4)' : 'var(--border)'}`, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                {TYPE_ICON[t]} {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Resource Title</label>
              <input style={inp} placeholder="e.g. CSE471 Final Spring 2024" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Course Code</label>
              <input style={inp} placeholder="CSE471" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Semester</label>
              <input style={inp} placeholder="Spring 2024" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>{form.type === 'youtube' ? 'YouTube URL' : form.type === 'pdf' ? 'PDF Link' : form.type === 'onedrive' ? 'OneDrive Link' : 'Google Drive Link'}</label>
              <input style={inp} placeholder={form.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'} value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
            </div>
          </div>
          <button onClick={contribute}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Submit Resource →
          </button>
        </div>
      )}

      {/* Resource list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', letterSpacing: '1px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
            {showBookmarks ? 'No saved resources yet. Click 📌 on any resource to save it.' : 'No resources found. Be the first to contribute!'}
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>
            <div style={{ fontSize: '20px', flexShrink: 0 }}>{TYPE_ICON[r.type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '3px' }}>{r.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '.5px' }}>{TYPE_LABEL[r.type]} · {r.semester}</div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginTop: '4px' }}>{r.course}</div>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => rate(r.id, n)}
                  style={{ background: 'none', border: 'none', fontSize: '16px', color: n <= Math.round(r.avg_rating) ? 'var(--red)' : '#3A3328', cursor: ratedIds[r.id] ? 'default' : 'crosshair', transition: 'transform .1s', lineHeight: 1 }}
                  onMouseEnter={e => !ratedIds[r.id] && (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>★</button>
              ))}
              <span style={{ fontSize: '10px', color: 'var(--faded)', marginLeft: '4px' }}>
                {r.avg_rating > 0 ? r.avg_rating.toFixed(1) : '—'} ({r.ratings.length})
              </span>
            </div>

            {/* Bookmark */}
            <button onClick={() => toggleBookmark(r.id)}
              style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 10px', color: bookmarks.includes(r.id) ? 'var(--bronze)' : 'var(--faded)', fontSize: '14px', cursor: 'crosshair', transition: 'all .15s', flexShrink: 0 }}>
              {bookmarks.includes(r.id) ? '📌' : '🔖'}
            </button>

            {/* Open link */}
            <a href={r.link} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none', border: '1px solid rgba(139,115,85,0.3)', padding: '6px 14px', flexShrink: 0, transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--paper)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--paper)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--bronze)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,115,85,0.3)' }}>
              Open →
            </a>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '32px' }}>
        {[
          { label: 'Total Resources', val: resources.length },
          { label: 'Past Papers', val: resources.filter(r => r.type === 'pdf').length },
          { label: 'Video Courses', val: resources.filter(r => r.type === 'youtube').length },
          { label: 'Drive Links', val: resources.filter(r => r.type === 'drive' || r.type === 'onedrive').length },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}