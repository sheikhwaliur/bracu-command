'use client'
import { useState, useEffect } from 'react'
import { checkRateLimit } from '@/lib/rateLimit'
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
}

const MOCK_RESOURCES: Resource[] = [
  { id: '1', type: 'pdf', title: 'CSE471 Final — Spring 2024', course: 'CSE471', semester: 'Spring 2024', link: '#', contributed_by: 'Anonymous', ratings: [5,5,4,5], avg_rating: 4.8 },
  { id: '2', type: 'drive', title: 'CSE482 Mid + Final Package', course: 'CSE482', semester: 'Fall 2023', link: '#', contributed_by: 'Anonymous', ratings: [4,5,4,3], avg_rating: 4.0 },
  { id: '3', type: 'drive', title: 'MAT215 Midterm 2019–2024', course: 'MAT215', semester: 'Multiple', link: '#', contributed_by: 'Anonymous', ratings: [5,5,5,4], avg_rating: 4.8 },
  { id: '4', type: 'youtube', title: 'Data Structures Full Course — Abdul Bari', course: 'CSE220', semester: 'Any', link: 'https://youtube.com', contributed_by: 'Anonymous', ratings: [5,5,5,5], avg_rating: 5.0 },
  { id: '5', type: 'youtube', title: 'OS Full Course — Neso Academy', course: 'CSE341', semester: 'Any', link: 'https://youtube.com', contributed_by: 'Anonymous', ratings: [5,5,4,5], avg_rating: 4.8 },
  { id: '6', type: 'onedrive', title: 'CSE220 Complete Notes', course: 'CSE220', semester: 'Spring 2024', link: '#', contributed_by: 'Anonymous', ratings: [4,4,5,4], avg_rating: 4.3 },
  { id: '7', type: 'pdf', title: 'CSE423 Past Papers Bundle', course: 'CSE423', semester: '2021–2024', link: '#', contributed_by: 'Anonymous', ratings: [4,5,4,3], avg_rating: 4.0 },
  { id: '8', type: 'youtube', title: 'Networks Full Course — Gate Smashers', course: 'CSE471', semester: 'Any', link: 'https://youtube.com', contributed_by: 'Anonymous', ratings: [4,4,5,4], avg_rating: 4.3 },
]

const TYPE_ICON: Record<string, string> = { pdf: '📄', drive: '🔗', onedrive: '☁️', youtube: '🎥' }
const TYPE_LABEL: Record<string, string> = { pdf: 'PDF', drive: 'Drive', onedrive: 'OneDrive', youtube: 'YouTube' }

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES)
  const [tab, setTab] = useState<'all'|'pdf'|'drive'|'onedrive'|'youtube'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'rating'|'newest'>('rating')
  const [showContribute, setShowContribute] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [ratedIds, setRatedIds] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({ title: '', course: '', semester: '', link: '', type: 'drive' as Resource['type'] })

  useEffect(() => {
    const saved = localStorage.getItem('bracu_bookmarks')
    if (saved) setBookmarks(JSON.parse(saved))
    const rated = localStorage.getItem('bracu_rated_resources')
    if (rated) setRatedIds(JSON.parse(rated))
  
    // Fetch from Supabase
    const fetchResources = async () => {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setResources(p => [...p, ...data.map((r: any) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          course: r.course,
          semester: r.semester || 'Any',
          link: r.link,
          contributed_by: 'Anonymous',
          ratings: r.ratings || [],
          avg_rating: r.avg_rating || 0,
        }))])
      }
    }
    fetchResources()
  }, [])

  const rate = (id: string, val: number) => {
    if (ratedIds[id]) return
    const newRated = { ...ratedIds, [id]: true }
    setRatedIds(newRated)
    localStorage.setItem('bracu_rated_resources', JSON.stringify(newRated))
    setResources(p => p.map(r => {
      if (r.id !== id) return r
      const newRatings = [...r.ratings, val]
      return { ...r, ratings: newRatings, avg_rating: parseFloat((newRatings.reduce((a,b)=>a+b,0)/newRatings.length).toFixed(1)) }
    }))
  }

  const toggleBookmark = (id: string) => {
    const newBm = bookmarks.includes(id) ? bookmarks.filter(b=>b!==id) : [...bookmarks, id]
    setBookmarks(newBm)
    localStorage.setItem('bracu_bookmarks', JSON.stringify(newBm))
  }

  const contribute = async () => {
    // Rate limit — max 5 resources per 10 minutes
    const { allowed, waitSeconds } = checkRateLimit({ key: 'resource', limitMs: 600000, maxAttempts: 5 })
    if (!allowed) {
      alert(`Too many submissions. Please wait ${waitSeconds} seconds.`)
      return
    }
    if (!form.title || !form.course || !form.link) return
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: form.title,
        type: form.type,
        course: form.course.toUpperCase(),
        semester: form.semester || 'Any',
        link: form.link,
      })
      .select()
      .single()
    if (error) { console.error(error); return }
    setResources(p => [data, ...p])
    setForm({ title: '', course: '', semester: '', link: '', type: 'drive' })
    setShowContribute(false)
  }

  const filtered = resources
    .filter(r => tab === 'all' || r.type === tab)
    .filter(r => !showBookmarks || bookmarks.includes(r.id))
    .filter(r => !search || (r.title+r.course+r.semester).toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort==='rating' ? b.avg_rating-a.avg_rating : parseInt(b.id)-parseInt(a.id))

  const inp: React.CSSProperties = { width: '100%', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout eyebrow="Academic Resource Archive" title="Every resource.<br/>One place." subtitle="Drive links, OneDrive, YouTube, PDFs — indexed by course. Community-rated.">

      <style>{`
        .res-row { display: flex; align-items: center; gap: 12px; }
        .res-stars { display: flex; gap: 2px; }
        .res-actions { display: flex; gap: 6px; align-items: center; }
        @media(max-width:640px) {
          .res-row { flex-direction: column; align-items: flex-start !important; gap: 10px; }
          .res-actions { width: 100%; justify-content: space-between; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          style={{ flex: 1, minWidth: '160px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 14px', outline: 'none' }}
          placeholder="Search by title, course..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 10px', outline: 'none' }}>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button onClick={() => setShowBookmarks(p=>!p)}
          style={{ background: showBookmarks ? 'var(--bronze)' : 'transparent', color: showBookmarks ? 'var(--paper)' : 'var(--faded)', border: '1px solid var(--border)', padding: '8px 14px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', flex: 1 }}>
          📌 Saved ({bookmarks.length})
        </button>
        <button onClick={() => setShowContribute(p=>!p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '8px 14px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', flex: 1 }}>
          + Contribute
        </button>
      </div>

      {/* Type tabs — scrollable on mobile */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {(['all','pdf','drive','onedrive','youtube'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flexShrink: 0, padding: '9px 14px', background: tab===t ? 'var(--ink2)' : 'var(--ink)', color: tab===t ? 'var(--paper)' : 'var(--faded)', border: 'none', borderBottom: tab===t ? '1px solid var(--red)' : '1px solid transparent', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {t === 'all' ? 'All' : TYPE_ICON[t]+' '+TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Contribute form */}
      {showContribute && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// Contribute Resource</div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {(['drive','onedrive','youtube','pdf'] as const).map(t => (
              <button key={t} onClick={() => setForm(p=>({...p,type:t}))}
                style={{ flexShrink: 0, padding: '7px 12px', background: form.type===t ? 'rgba(232,57,14,0.1)' : 'transparent', color: form.type===t ? 'var(--red)' : 'var(--faded)', border: `1px solid ${form.type===t ? 'rgba(232,57,14,0.4)' : 'var(--border)'}`, fontSize: '10px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                {TYPE_ICON[t]} {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><label style={lbl}>Title</label><input style={inp} placeholder="CSE471 Final 2024" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
            <div><label style={lbl}>Course Code</label><input style={inp} placeholder="CSE471" value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div><label style={lbl}>Semester</label><input style={inp} placeholder="Spring 2024" value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))} /></div>
            <div><label style={lbl}>Link</label><input style={inp} placeholder="https://..." value={form.link} onChange={e=>setForm(p=>({...p,link:e.target.value}))} /></div>
          </div>
          <button onClick={contribute} style={{ width: '100%', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Submit →
          </button>
        </div>
      )}

      {/* Resource list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
            {showBookmarks ? 'No saved resources yet.' : 'No resources found.'}
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px 16px', transition: 'background .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='var(--ink2)')}
            onMouseLeave={e=>(e.currentTarget.style.background='var(--ink)')}>

            <div className="res-row">
              {/* Icon + Info */}
              <div style={{ fontSize: '20px', flexShrink: 0 }}>{TYPE_ICON[r.type]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '2px', wordBreak: 'break-word' }}>{r.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)' }}>{TYPE_LABEL[r.type]} · {r.semester}</div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginTop: '3px' }}>{r.course}</div>
              </div>

              {/* Actions */}
              <div className="res-actions">
                {/* Stars */}
                <div className="res-stars">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => rate(r.id, n)}
                      style={{ background: 'none', border: 'none', fontSize: '15px', color: n<=Math.round(r.avg_rating) ? 'var(--red)' : '#3A3328', cursor: ratedIds[r.id] ? 'default' : 'crosshair', lineHeight: 1, padding: '0 1px' }}>★</button>
                  ))}
                  <span style={{ fontSize: '9px', color: 'var(--faded)', marginLeft: '3px' }}>
                    {r.avg_rating > 0 ? r.avg_rating.toFixed(1) : '—'}
                  </span>
                </div>

                {/* Bookmark */}
                <button onClick={() => toggleBookmark(r.id)}
                  style={{ background: 'none', border: '1px solid var(--border)', padding: '5px 8px', color: bookmarks.includes(r.id) ? 'var(--bronze)' : 'var(--faded)', fontSize: '13px', cursor: 'crosshair', flexShrink: 0 }}>
                  {bookmarks.includes(r.id) ? '📌' : '🔖'}
                </button>

                {/* Open */}
                <a href={r.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none', border: '1px solid rgba(139,115,85,0.3)', padding: '5px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Open →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Total', val: resources.length },
          { label: 'PDFs', val: resources.filter(r=>r.type==='pdf').length },
          { label: 'Videos', val: resources.filter(r=>r.type==='youtube').length },
          { label: 'Drives', val: resources.filter(r=>r.type==='drive'||r.type==='onedrive').length },
        ].map((s,i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
            <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}