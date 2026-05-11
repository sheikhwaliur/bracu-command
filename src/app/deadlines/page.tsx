'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Deadline {
  id: string
  title: string
  course: string
  type: 'assignment' | 'project' | 'lab' | 'presentation' | 'report'
  dueDate: string
  dueTime: string
  priority: 'high' | 'medium' | 'low'
  done: boolean
  notes: string
  submissionLink: string
}

const TYPE_ICON: Record<string, string> = {
  assignment: '📝',
  project: '🚀',
  lab: '🧪',
  presentation: '🎤',
  report: '📄',
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--bronze)',
  low: '#5fd49a',
}

function getDaysLeft(dateStr: string, timeStr: string) {
  const due = new Date(`${dateStr}T${timeStr || '23:59'}`)
  const now = new Date()
  const diff = due.getTime() - now.getTime()
  if (diff < 0) return { past: true, days: 0, hours: 0, label: 'Overdue' }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days === 0) return { past: false, days: 0, hours, label: `${hours}h left` }
  if (days === 1) return { past: false, days: 1, hours, label: 'Tomorrow' }
  return { past: false, days, hours, label: `${days} days left` }
}

export default function DeadlinesPage() {
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const [deadlines, setDeadlines] = useState<Deadline[]>([
    { id: '1', title: 'Assignment 3 — Sorting Algorithms', course: 'CSE220', type: 'assignment', dueDate: fmt(tomorrow), dueTime: '23:59', priority: 'high', done: false, notes: 'Implement merge sort and quick sort', submissionLink: 'https://classroom.google.com' },
    { id: '2', title: 'Lab Report 2 — RC Circuit', course: 'PHY111', type: 'lab', dueDate: fmt(nextWeek), dueTime: '17:00', priority: 'medium', done: false, notes: 'Include circuit diagrams', submissionLink: '' },
    { id: '3', title: 'Term Project Milestone 1', course: 'CSE370', type: 'project', dueDate: fmt(nextWeek), dueTime: '23:59', priority: 'high', done: false, notes: 'Submit requirements document', submissionLink: '' },
    { id: '4', title: 'Assignment 1 — Linear Equations', course: 'MAT215', type: 'assignment', dueDate: fmt(today), dueTime: '23:59', priority: 'high', done: true, notes: '', submissionLink: '' },
  ])

  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending')
  const [sortBy, setSortBy] = useState<'due' | 'priority' | 'course'>('due')
  const [form, setForm] = useState<Omit<Deadline, 'id' | 'done'>>({
    title: '', course: '', type: 'assignment', dueDate: fmt(nextWeek),
    dueTime: '23:59', priority: 'medium', notes: '', submissionLink: ''
  })

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bracu_deadlines')
    if (saved) setDeadlines(JSON.parse(saved))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bracu_deadlines', JSON.stringify(deadlines))
  }, [deadlines])

  const addDeadline = () => {
    if (!form.title || !form.course) return
    setDeadlines(p => [...p, { ...form, id: Date.now().toString(), done: false }])
    setForm({ title: '', course: '', type: 'assignment', dueDate: fmt(nextWeek), dueTime: '23:59', priority: 'medium', notes: '', submissionLink: '' })
    setShowAdd(false)
  }

  const toggleDone = (id: string) => setDeadlines(p => p.map(d => d.id === id ? { ...d, done: !d.done } : d))
  const removeDeadline = (id: string) => setDeadlines(p => p.filter(d => d.id !== id))

  const priorityVal = (p: string) => ({ high: 3, medium: 2, low: 1 }[p] || 0)

  const filtered = deadlines
    .filter(d => filter === 'all' || (filter === 'pending' ? !d.done : d.done))
    .sort((a, b) => {
      if (sortBy === 'due') return new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime()
      if (sortBy === 'priority') return priorityVal(b.priority) - priorityVal(a.priority)
      return a.course.localeCompare(b.course)
    })

  const pending = deadlines.filter(d => !d.done)
  const overdue = pending.filter(d => getDaysLeft(d.dueDate, d.dueTime).past)
  const dueToday = pending.filter(d => { const tl = getDaysLeft(d.dueDate, d.dueTime); return !tl.past && tl.days === 0 })
  const dueThisWeek = pending.filter(d => { const tl = getDaysLeft(d.dueDate, d.dueTime); return !tl.past && tl.days <= 7 })

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Deadline Tracker"
      title="Never miss<br/>a deadline."
      subtitle="Track all assignments, projects, labs and presentations. Sorted by urgency. Saved to your device."
    >
      {/* Alert bar for overdue/today */}
      {(overdue.length > 0 || dueToday.length > 0) && (
        <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', padding: '14px 20px', marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {overdue.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--red)' }}>
              ⚠️ <strong>{overdue.length}</strong> overdue deadline{overdue.length > 1 ? 's' : ''}
            </div>
          )}
          {dueToday.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--bronze)' }}>
              🔔 <strong>{dueToday.length}</strong> due today
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        {[
          { label: 'Total', val: deadlines.length, color: 'var(--paper)' },
          { label: 'Pending', val: pending.length, color: 'var(--red)' },
          { label: 'Due This Week', val: dueThisWeek.length, color: 'var(--bronze)' },
          { label: 'Completed', val: deadlines.filter(d => d.done).length, color: '#5fd49a' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: s.color, letterSpacing: '1px' }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['all', 'pending', 'done'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 14px', background: filter === f ? 'var(--red)' : 'transparent', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${filter === f ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : '✓ Done'}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '8px 12px', outline: 'none' }}>
          <option value="due">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="course">Sort: Course</option>
        </select>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '9px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', marginLeft: 'auto' }}>
          + Add Deadline
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Add Deadline</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Title</label>
              <input style={inp} placeholder="Assignment 3 — Sorting Algorithms" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Course Code</label>
              <input style={inp} placeholder="CSE220" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value.toUpperCase() }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Type</label>
              <select style={inp} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
                {Object.keys(TYPE_ICON).map(t => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <select style={inp} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Due Date</label>
              <input style={inp} type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Due Time</label>
              <input style={inp} type="time" value={form.dueTime} onChange={e => setForm(p => ({ ...p, dueTime: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Notes</label>
              <input style={inp} placeholder="What to include..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Submission Link</label>
              <input style={inp} placeholder="https://classroom.google.com/..." value={form.submissionLink} onChange={e => setForm(p => ({ ...p, submissionLink: e.target.value }))} />
            </div>
          </div>
          <button onClick={addDeadline}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Add Deadline →
          </button>
        </div>
      )}

      {/* Deadline list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)', letterSpacing: '1px' }}>
            {filter === 'done' ? 'No completed deadlines yet.' : 'No pending deadlines. You\'re all caught up! 🎉'}
          </div>
        )}
        {filtered.map(d => {
          const tl = getDaysLeft(d.dueDate, d.dueTime)
          const urgencyColor = d.done ? '#5fd49a' : tl.past ? '#ff4444' : tl.days === 0 ? 'var(--red)' : tl.days <= 3 ? 'var(--bronze)' : 'var(--faded)'

          return (
            <div key={d.id}
              style={{ background: 'var(--ink)', border: `1px solid ${tl.past && !d.done ? 'rgba(232,57,14,0.3)' : 'var(--border)'}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', opacity: d.done ? 0.5 : 1, transition: 'all .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

              {/* Checkbox */}
              <button onClick={() => toggleDone(d.id)}
                style={{ width: '22px', height: '22px', border: `1px solid ${d.done ? '#5fd49a' : 'var(--border)'}`, background: d.done ? '#5fd49a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', flexShrink: 0, fontSize: '12px', color: 'var(--ink)', transition: 'all .15s' }}>
                {d.done ? '✓' : ''}
              </button>

              {/* Priority dot */}
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PRIORITY_COLOR[d.priority], display: 'inline-block', flexShrink: 0 }} />

              {/* Type icon */}
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{TYPE_ICON[d.type]}</span>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '3px', textDecoration: d.done ? 'line-through' : 'none' }}>{d.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '.5px' }}>
                  <span style={{ color: 'var(--red)', marginRight: '8px' }}>{d.course}</span>
                  {new Date(d.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {d.dueTime}
                </div>
                {d.notes && <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '3px', fontStyle: 'italic' }}>{d.notes}</div>}
              </div>

              {/* Time left */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: urgencyColor, letterSpacing: '1px', lineHeight: 1 }}>
                  {d.done ? 'DONE' : tl.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '3px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {!d.done && !tl.past && new Date(d.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Submission link */}
              {d.submissionLink && !d.done && (
                <a href={d.submissionLink} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--bronze)', textDecoration: 'none', border: '1px solid rgba(139,115,85,0.3)', padding: '5px 10px', flexShrink: 0, transition: 'all .15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--bronze)' }}>
                  Submit →
                </a>
              )}

              {/* Remove */}
              <button onClick={() => removeDeadline(d.id)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', fontSize: '11px', flexShrink: 0, transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}