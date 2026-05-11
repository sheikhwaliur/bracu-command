'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Exam {
  id: string
  course: string
  type: 'midterm' | 'final' | 'quiz' | 'lab' | 'assignment'
  date: string
  time: string
  room: string
  notes: string
}

const TYPE_COLOR: Record<string, string> = {
  midterm: 'var(--red)',
  final: '#ff4444',
  quiz: 'var(--bronze)',
  lab: '#5fd49a',
  assignment: 'var(--faded)',
}

const TYPE_LABEL: Record<string, string> = {
  midterm: '📝 Midterm',
  final: '🎯 Final',
  quiz: '⚡ Quiz',
  lab: '🧪 Lab',
  assignment: '📋 Assignment',
}

function getTimeLeft(dateStr: string, timeStr: string) {
  const examDate = new Date(`${dateStr}T${timeStr || '09:00'}`)
  const now = new Date()
  const diff = examDate.getTime() - now.getTime()

  if (diff < 0) return { past: true, days: 0, hours: 0, mins: 0, secs: 0, total: diff }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)
  return { past: false, days, hours, mins, secs, total: diff }
}

function getUrgencyColor(days: number) {
  if (days <= 1) return '#ff4444'
  if (days <= 3) return 'var(--red)'
  if (days <= 7) return 'var(--bronze)'
  return '#5fd49a'
}

function CountdownDisplay({ exam }: { exam: Exam }) {
    const [time, setTime] = useState(getTimeLeft(exam.date, exam.time))
  
    useEffect(() => {
      const iv = setInterval(() => setTime(getTimeLeft(exam.date, exam.time)), 1000)
      return () => clearInterval(iv)
    }, [exam.date, exam.time])
  
    if (time.past) {
      return <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--faded)', letterSpacing: '2px', flexShrink: 0 }}>DONE</div>
    }
  
    const urgency = getUrgencyColor(time.days)
    const units = time.days > 0
      ? [{ v: time.days, l: 'days' }, { v: time.hours, l: 'hrs' }, { v: time.mins, l: 'min' }, { v: time.secs, l: 'sec' }]
      : [{ v: time.hours, l: 'hrs' }, { v: time.mins, l: 'min' }, { v: time.secs, l: 'sec' }]
  
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
        {units.map((u, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ textAlign: 'center', minWidth: '36px' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(18px,4vw,28px)', color: urgency, letterSpacing: '1px', lineHeight: 1 }}>
                {String(u.v).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '7px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{u.l}</div>
            </div>
            {i < units.length - 1 && (
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(16px,3vw,22px)', color: urgency, paddingBottom: '10px' }}>:</div>
            )}
          </div>
        ))}
      </div>
    )
}

export default function CountdownPage() {
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
  const twoWeeks = new Date(today); twoWeeks.setDate(today.getDate() + 14)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const [exams, setExams] = useState<Exam[]>([
    { id: '1', course: 'CSE471', type: 'midterm', date: fmt(nextWeek), time: '09:00', room: 'UB40201', notes: 'Cover chapters 1-5' },
    { id: '2', course: 'MAT215', type: 'quiz', date: fmt(tomorrow), time: '11:30', room: 'UB30101', notes: 'Eigenvalues topic' },
    { id: '3', course: 'CSE341', type: 'final', date: fmt(twoWeeks), time: '14:00', room: 'UB20301', notes: 'Full syllabus' },
    { id: '4', course: 'CSE220', type: 'assignment', date: fmt(nextWeek), time: '23:59', room: 'Online', notes: 'Submit on Google Classroom' },
  ])

  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState<Omit<Exam, 'id'>>({
    course: '', type: 'midterm', date: fmt(nextWeek), time: '09:00', room: '', notes: ''
  })

  const addExam = () => {
    if (!form.course || !form.date) return
    setExams(p => [...p, { ...form, id: Date.now().toString() }])
    setForm({ course: '', type: 'midterm', date: fmt(nextWeek), time: '09:00', room: '', notes: '' })
    setShowAdd(false)
  }

  const removeExam = (id: string) => setExams(p => p.filter(e => e.id !== id))

  const sorted = [...exams]
    .filter(e => filter === 'all' || e.type === filter)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())

  const upcoming = exams.filter(e => !getTimeLeft(e.date, e.time).past)
  const nextExam = upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0]

  const inp: React.CSSProperties = {
    background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)',
    fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%'
  }

  return (
    <PageLayout
      eyebrow="Exam Countdown"
      title="Never miss<br/>an exam again."
      subtitle="Add your exams and see live countdowns. Sorted by urgency — most urgent first."
    >
      {/* Next exam hero */}
      {nextExam && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px 32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px', fontWeight: 700 }}>// NEXT EXAM</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '36px', color: 'var(--paper)', letterSpacing: '2px', lineHeight: 1 }}>{nextExam.course}</div>
              <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '4px', letterSpacing: '.5px' }}>
                {TYPE_LABEL[nextExam.type]} · {new Date(nextExam.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {nextExam.time} · {nextExam.room}
              </div>
            </div>
            <CountdownDisplay exam={nextExam} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
          {['all', 'midterm', 'final', 'quiz', 'lab', 'assignment'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 12px', background: filter === f ? 'var(--red)' : 'transparent', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${filter === f ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s', whiteSpace: 'nowrap' }}>
              {f === 'all' ? 'All' : TYPE_LABEL[f]}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '9px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', flexShrink: 0 }}>
          + Add Exam
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Add Exam / Deadline</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Course Code</label>
              <input style={inp} placeholder="CSE471" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Type</label>
              <select style={inp} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Exam['type'] }))}>
                {Object.keys(TYPE_LABEL).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Room / Location</label>
              <input style={inp} placeholder="UB40201" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Date</label>
              <input style={inp} type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Time</label>
              <input style={inp} type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Notes</label>
              <input style={inp} placeholder="Topics to cover..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <button onClick={addExam}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Add →
          </button>
        </div>
      )}

      {/* Exam list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {sorted.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)', letterSpacing: '1px' }}>
            No exams added yet. Click "+ Add Exam" to get started.
          </div>
        )}
        {sorted.map(e => {
          const tl = getTimeLeft(e.date, e.time)
          return (
            <div key={e.id}
              style={{ background: 'var(--ink)', border: `1px solid ${tl.past ? 'rgba(242,237,228,0.04)' : 'var(--border)'}`, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '20px', opacity: tl.past ? 0.4 : 1, transition: 'background .15s' }}
              onMouseEnter={e2 => (e2.currentTarget.style.background = 'var(--ink2)')}
              onMouseLeave={e2 => (e2.currentTarget.style.background = 'var(--ink)')}>

              {/* Type badge */}
              <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: TYPE_COLOR[e.type], border: `1px solid ${TYPE_COLOR[e.type]}`, padding: '3px 8px', flexShrink: 0, opacity: 0.8 }}>
                {e.type}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '1px', lineHeight: 1 }}>{e.course}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '4px', letterSpacing: '.5px' }}>
                  {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {e.time}{e.room ? ` · ${e.room}` : ''}
                </div>
                {e.notes && <div style={{ fontSize: '10px', color: 'var(--dim)', marginTop: '3px', fontStyle: 'italic' }}>{e.notes}</div>}
              </div>

              {/* Countdown */}
              <CountdownDisplay exam={e} />

              {/* Remove */}
              <button onClick={() => removeExam(e.id)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', fontSize: '12px', flexShrink: 0, transition: 'all .15s' }}
                onMouseEnter={el => { (el.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (el.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                onMouseLeave={el => { (el.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (el.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Total', val: exams.length },
          { label: 'Upcoming', val: exams.filter(e => !getTimeLeft(e.date, e.time).past).length },
          { label: 'This Week', val: exams.filter(e => { const tl = getTimeLeft(e.date, e.time); return !tl.past && tl.days <= 7 }).length },
          { label: 'Today', val: exams.filter(e => { const tl = getTimeLeft(e.date, e.time); return !tl.past && tl.days === 0 }).length },
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