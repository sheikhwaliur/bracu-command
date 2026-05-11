'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Notice {
  id: string
  title: string
  body: string
  category: 'academic' | 'exam' | 'event' | 'admin' | 'urgent'
  date: string
  pinned: boolean
  source: string
  link?: string
}

const CAT_COLOR: Record<string, string> = {
  academic: 'var(--bronze)',
  exam: 'var(--red)',
  event: '#5fd49a',
  admin: 'var(--faded)',
  urgent: '#ff4444',
}

const CAT_LABEL: Record<string, string> = {
  academic: '📚 Academic',
  exam: '📝 Exam',
  event: '🎉 Event',
  admin: '⚙️ Admin',
  urgent: '🚨 Urgent',
}

const MOCK_NOTICES: Notice[] = [
  {
    id: '1', title: 'Spring 2026 Final Exam Schedule Released', pinned: true,
    body: 'The final examination schedule for Spring 2026 has been published on the BRACU website. All students are advised to check their exam dates and venues. Any conflicts must be reported to the Registrar\'s Office within 3 working days.',
    category: 'exam', date: '2026-05-10', source: 'Registrar\'s Office', link: 'https://bracu.ac.bd'
  },
  {
    id: '2', title: 'Advising for Summer 2026 Begins May 15', pinned: true,
    body: 'Course advising for Summer 2026 semester will begin on May 15, 2026. Students must complete advising before course registration opens on May 20. Check USIS for your advising appointment time.',
    category: 'academic', date: '2026-05-09', source: 'Academic Office', link: 'https://usis.bracu.ac.bd'
  },
  {
    id: '3', title: 'Campus Internet Maintenance — May 14 (11PM–3AM)', pinned: false,
    body: 'The IT department will be conducting scheduled maintenance on the campus network infrastructure. Internet access will be unavailable from 11PM to 3AM on May 14. Plan your work accordingly.',
    category: 'urgent', date: '2026-05-08', source: 'IT Department'
  },
  {
    id: '4', title: 'BRACU Career Fair 2026 — Registration Open', pinned: false,
    body: 'BRACU Career Fair 2026 will be held on May 25–26 at the main campus. Over 60 companies will be participating. Students can register via the Career Services portal. Bring printed CVs and dress formally.',
    category: 'event', date: '2026-05-07', source: 'Career Services', link: 'https://bracu.ac.bd/career'
  },
  {
    id: '5', title: 'Grade Submission Deadline for Faculty', pinned: false,
    body: 'Faculty members must submit all Spring 2026 grades by May 20, 2026. Students who believe there is a grading error should contact their course instructor first, then the department if unresolved.',
    category: 'academic', date: '2026-05-06', source: 'Examination Department'
  },
  {
    id: '6', title: 'New Policy: Mobile Phones in Examination Halls', pinned: false,
    body: 'Effective immediately, mobile phones found in examination halls will result in automatic cancellation of the exam. Phones must be stored in bags outside the hall. Smart watches are also prohibited.',
    category: 'admin', date: '2026-05-05', source: 'Examination Department'
  },
  {
    id: '7', title: 'Research Symposium — Call for Papers', pinned: false,
    body: 'The CSE department invites undergraduate and graduate students to submit research papers for the Annual Research Symposium 2026. Deadline for abstract submission is May 20. Selected papers will be published.',
    category: 'event', date: '2026-05-04', source: 'CSE Department'
  },
  {
    id: '8', title: 'Library Hours Extended During Finals Week', pinned: false,
    body: 'The BRACU library will extend its hours during the final examination period. The library will be open from 7AM to 11PM Sunday through Thursday. Friday and Saturday hours remain unchanged.',
    category: 'academic', date: '2026-05-03', source: 'Library Services'
  },
]

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES)
  const [category, setCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [form, setForm] = useState({ title: '', body: '', category: 'academic' as Notice['category'], source: '', link: '' })

  useEffect(() => {
    const s = localStorage.getItem('bracu_saved_notices')
    if (s) setSaved(JSON.parse(s))
  }, [])

  const toggleSave = (id: string) => {
    const newSaved = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id]
    setSaved(newSaved)
    localStorage.setItem('bracu_saved_notices', JSON.stringify(newSaved))
  }

  const addNotice = () => {
    if (!form.title || !form.body) return
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: form.title,
      body: form.body,
      category: form.category,
      date: new Date().toISOString().split('T')[0],
      pinned: false,
      source: form.source || 'Student Post',
      link: form.link,
    }
    setNotices(p => [newNotice, ...p])
    setForm({ title: '', body: '', category: 'academic', source: '', link: '' })
    setShowAdd(false)
  }

  const filtered = notices
    .filter(n => category === 'all' || n.category === category)
    .filter(n => !search || (n.title + n.body + n.source).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Notice Board"
      title="Stay informed.<br/>Miss nothing."
      subtitle="Official BRACU announcements, exam schedules, events, and important updates — all in one place."
    >
      {/* Urgent notices banner */}
      {notices.filter(n => n.category === 'urgent').length > 0 && (
        <div style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>🚨</span>
          <div style={{ fontSize: '11px', color: '#ff4444', letterSpacing: '.3px' }}>
            <strong>{notices.filter(n => n.category === 'urgent').length} urgent notice{notices.filter(n => n.category === 'urgent').length > 1 ? 's' : ''}</strong> — please read immediately
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none' }}
          placeholder="Search notices..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => setShowAdd(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '10px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', flexShrink: 0 }}>
          + Post Notice
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['all', 'urgent', 'exam', 'academic', 'event', 'admin'].map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{ padding: '6px 14px', background: category === c ? (CAT_COLOR[c] || 'var(--red)') : 'transparent', color: category === c ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${category === c ? (CAT_COLOR[c] || 'var(--red)') : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {c === 'all' ? 'All' : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Post a Notice</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Title</label>
            <input style={inp} placeholder="Notice title..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Body</label>
            <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Notice content..."
              rows={4}
              style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Category</label>
              <select style={inp} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Notice['category'] }))}>
                {Object.keys(CAT_LABEL).map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Source</label>
              <input style={inp} placeholder="e.g. CSE Department" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Link (optional)</label>
              <input style={inp} placeholder="https://..." value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
            </div>
          </div>
          <button onClick={addNotice}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Post Notice →
          </button>
        </div>
      )}

      {/* Notice list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)', letterSpacing: '1px' }}>
            No notices found.
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id}
            style={{ background: 'var(--ink)', border: `1px solid ${n.category === 'urgent' ? 'rgba(255,68,68,0.2)' : 'var(--border)'}`, transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

            {/* Notice header */}
            <div style={{ padding: '16px 20px', cursor: 'crosshair' }} onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Pin + category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, alignItems: 'center', marginTop: '2px' }}>
                  {n.pinned && <span style={{ fontSize: '12px' }}>📌</span>}
                  <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: CAT_COLOR[n.category], border: `1px solid ${CAT_COLOR[n.category]}`, padding: '2px 6px', opacity: .85, whiteSpace: 'nowrap' }}>
                    {n.category}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '4px', lineHeight: 1.3 }}>{n.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>{n.source}</span>
                    <span>{new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {/* Preview text when collapsed */}
                  {expanded !== n.id && (
                    <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '6px', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {n.body}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); toggleSave(n.id) }}
                    style={{ background: 'none', border: '1px solid var(--border)', color: saved.includes(n.id) ? 'var(--bronze)' : 'var(--faded)', padding: '4px 8px', fontSize: '12px', cursor: 'crosshair', transition: 'all .15s' }}>
                    {saved.includes(n.id) ? '📌' : '🔖'}
                  </button>
                  <span style={{ fontSize: '10px', color: 'var(--faded)' }}>{expanded === n.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded body */}
              {expanded === n.id && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '12px', color: 'var(--faded)', lineHeight: 1.9, letterSpacing: '.2px' }}>{n.body}</p>
                  {n.link && (
                    <a href={n.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '12px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none', border: '1px solid rgba(139,115,85,0.3)', padding: '6px 14px', transition: 'all .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--bronze)' }}>
                      View Full Notice →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Total Notices', val: notices.length },
          { label: 'Pinned', val: notices.filter(n => n.pinned).length },
          { label: 'Urgent', val: notices.filter(n => n.category === 'urgent').length },
          { label: 'Saved', val: saved.length },
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