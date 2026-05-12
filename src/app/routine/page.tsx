'use client'
import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
}

interface Section {
  sectionId: number
  courseCode: string
  courseName: string
  sectionName: string
  faculties: string
  capacity: number
  consumedSeat: number
  availableSeats: number
  courseCredit: number
  roomName: string
  courseType: string
  sectionSchedule?: {
    finalExamDetail?: string
    midExamDetail?: string
    finalExamDate?: string
    midExamDate?: string
    classSchedules?: ClassSchedule[]
  }
}

const CDN_URL = 'https://usis-cdn.eniamza.com/connect.json'

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const DAY_SHORT: Record<string, string> = {
  SUNDAY: 'Sun', MONDAY: 'Mon', TUESDAY: 'Tue',
  WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat'
}

const formatTime = (t: string) => {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const timeToMins = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const hasConflict = (a: Section, b: Section): boolean => {
  const aSlots = a.sectionSchedule?.classSchedules || []
  const bSlots = b.sectionSchedule?.classSchedules || []
  for (const as of aSlots) {
    for (const bs of bSlots) {
      if (as.day === bs.day) {
        const aStart = timeToMins(as.startTime)
        const aEnd = timeToMins(as.endTime)
        const bStart = timeToMins(bs.startTime)
        const bEnd = timeToMins(bs.endTime)
        if (aStart < bEnd && aEnd > bStart) return true
      }
    }
  }
  return false
}

export default function RoutineBuilderPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [selected, setSelected] = useState<Section[]>([])
  const [preview, setPreview] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [hideConflicts, setHideConflicts] = useState(false)
  const [dayFilter, setDayFilter] = useState('Any')
  const [activeTab, setActiveTab] = useState<'list' | 'timetable' | 'exam'>('list')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${CDN_URL}?t=${Date.now()}`)
      const raw = await res.json()
      const list = Array.isArray(raw) ? raw : raw.courses || []

      const normalized: Section[] = list
        .filter((c: any) => c && c.courseCode && c.sectionType !== 'LAB')
        .map((c: any) => ({
          sectionId: c.sectionId,
          courseCode: c.courseCode || '',
          courseName: c.courseName || '',
          sectionName: c.sectionName || '',
          faculties: c.faculties || 'TBA',
          capacity: Number(c.capacity || 0),
          consumedSeat: Number(c.consumedSeat || 0),
          availableSeats: Math.max(0, Number(c.capacity || 0) - Number(c.consumedSeat || 0)),
          courseCredit: Number(c.courseCredit || 0),
          roomName: c.roomName || '',
          courseType: c.courseType || '',
          sectionSchedule: c.sectionSchedule,
        }))

      setSections(normalized)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const totalCredits = selected.reduce((a, s) => a + s.courseCredit, 0)

  const isSelected = (s: Section) => selected.some(x => x.sectionId === s.sectionId)

  const conflictsWithSelected = (s: Section) =>
    selected.some(x => x.sectionId !== s.sectionId && hasConflict(x, s))

  const addSection = (s: Section) => {
    if (isSelected(s)) return
    // Remove other sections of same course
    const withoutSameCourse = selected.filter(x => x.courseCode !== s.courseCode)
    setSelected([...withoutSameCourse, s])
    setPreview(s)
  }

  const removeSection = (s: Section) => {
    setSelected(p => p.filter(x => x.sectionId !== s.sectionId))
    if (preview?.sectionId === s.sectionId) setPreview(null)
  }

  const filtered = sections.filter(s => {
    if (availableOnly && s.availableSeats === 0) return false
    if (hideConflicts && conflictsWithSelected(s)) return false
    if (dayFilter !== 'Any') {
      const hasDayClass = s.sectionSchedule?.classSchedules?.some(c => c.day === dayFilter)
      if (!hasDayClass) return false
    }
    if (search) {
      const q = search.toLowerCase()
      if (!(s.courseCode.toLowerCase().includes(q) ||
        s.courseName.toLowerCase().includes(q) ||
        s.faculties.toLowerCase().includes(q) ||
        s.sectionName.toLowerCase().includes(q))) return false
    }
    return true
  })

  // Build timetable slots
  const timetableSlots: Record<string, Record<string, Section>> = {}
  for (const s of selected) {
    for (const slot of s.sectionSchedule?.classSchedules || []) {
      const key = `${slot.startTime}-${slot.endTime}`
      if (!timetableSlots[key]) timetableSlots[key] = {}
      timetableSlots[key][slot.day] = s
    }
  }
  const sortedTimes = Object.keys(timetableSlots).sort((a, b) =>
    timeToMins(a.split('-')[0]) - timeToMins(b.split('-')[0])
  )

  const getAvailColor = (avail: number, cap: number) => {
    if (avail === 0) return 'var(--red)'
    if (cap > 0 && avail / cap < 0.2) return 'var(--bronze)'
    return '#5fd49a'
  }

  return (
    <PageLayout
      eyebrow="Routine Builder"
      title="Build your routine.<br/>Avoid conflicts."
      subtitle="Live USIS data. Add sections, see your weekly timetable and exam schedule instantly."
    >
      <style>{`
        .rb-layout { display: grid; grid-template-columns: 1fr 1fr 280px; gap: 2px; background: var(--border); border: 1px solid var(--border); height: calc(100vh - 360px); min-height: 500px; }
        .rb-panel { display: flex; flex-direction: column; overflow: hidden; }
        .rb-scroll { flex: 1; overflow-y: auto; }
        .rb-tabs { display: none; gap: 2px; margin-bottom: 12px; }
        @media(max-width: 900px) {
          .rb-layout { grid-template-columns: 1fr !important; height: auto !important; }
          .rb-tabs { display: flex !important; }
          .rb-panel { display: none; height: 60vh; }
          .rb-panel.show { display: flex !important; }
        }
        .tt-grid { width: 100%; border-collapse: collapse; font-size: 10px; }
        .tt-grid th { background: var(--ink2); padding: 8px 6px; text-align: center; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: var(--faded); border: 1px solid var(--border); }
        .tt-grid td { border: 1px solid var(--border); padding: 6px 4px; vertical-align: top; min-width: 80px; height: 50px; background: var(--ink); }
        .tt-cell { background: rgba(232,57,14,0.12); border: 1px solid rgba(232,57,14,0.3); padding: 4px 6px; border-radius: 2px; }
      `}</style>

      {/* Mobile tabs */}
      <div className="rb-tabs">
        {(['list', 'timetable', 'exam'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, padding: '9px', background: activeTab === t ? 'var(--red)' : 'var(--ink2)', color: activeTab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {t === 'list' ? '📋 Courses' : t === 'timetable' ? '🗓️ Timetable' : '📝 Exams'}
          </button>
        ))}
      </div>

      {/* 3-panel layout */}
      <div className="rb-layout">

        {/* LEFT — Remaining courses */}
        <div className={`rb-panel${activeTab === 'list' ? ' show' : ''}`} style={{ background: 'var(--ink)' }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '10px', letterSpacing: '1px' }}>
              {loading ? 'Loading...' : `${filtered.length} sections`}
            </div>
            <input
              placeholder="Search course, faculty, section..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '8px 10px', outline: 'none', marginBottom: '8px' }}
            />
            {/* Filters */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <button onClick={() => setAvailableOnly(p => !p)}
                style={{ padding: '4px 10px', background: availableOnly ? 'rgba(95,212,154,0.15)' : 'transparent', color: availableOnly ? '#5fd49a' : 'var(--faded)', border: `1px solid ${availableOnly ? 'rgba(95,212,154,0.4)' : 'var(--border)'}`, fontSize: '9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: availableOnly ? '#5fd49a' : 'var(--faded)', display: 'inline-block' }} />
                Available Now
              </button>
              <button onClick={() => setHideConflicts(p => !p)}
                style={{ padding: '4px 10px', background: hideConflicts ? 'rgba(232,57,14,0.15)' : 'transparent', color: hideConflicts ? 'var(--red)' : 'var(--faded)', border: `1px solid ${hideConflicts ? 'rgba(232,57,14,0.4)' : 'var(--border)'}`, fontSize: '9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hideConflicts ? 'var(--red)' : 'var(--faded)', display: 'inline-block' }} />
                Hide Conflicts
              </button>
              <select value={dayFilter} onChange={e => setDayFilter(e.target.value)}
                style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', padding: '4px 8px', outline: 'none' }}>
                <option>Any</option>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Section list */}
          <div className="rb-scroll">
            {loading && (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '10px', color: 'var(--faded)', letterSpacing: '1px' }}>
                Loading live USIS data...
              </div>
            )}
            {filtered.map(s => {
              const conflict = conflictsWithSelected(s)
              const sel = isSelected(s)
              const avail = s.availableSeats
              const availColor = getAvailColor(avail, s.capacity)

              return (
                <div key={s.sectionId}
                  onClick={() => setPreview(s)}
                  style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'crosshair', background: sel ? 'rgba(232,57,14,0.06)' : conflict ? 'rgba(0,0,0,0.3)' : 'transparent', opacity: conflict && !sel ? 0.5 : 1, transition: 'background .1s' }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--ink2)' }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = sel ? 'rgba(232,57,14,0.06)' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)' }}>{s.courseCode} - {s.sectionName}</span>
                        <span style={{ fontSize: '9px', color: availColor, fontWeight: 700 }}>({avail}/{s.capacity})</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--faded)' }}>
                        <span style={{ color: 'var(--bronze)', fontWeight: 700 }}>{s.faculties}</span>
                        {s.faculties && s.faculties !== 'TBA' && (
                          <span style={{ color: 'var(--dim)' }}> · {s.faculties}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); sel ? removeSection(s) : addSection(s) }}
                      style={{ background: sel ? 'rgba(232,57,14,0.15)' : 'var(--ink2)', color: sel ? 'var(--red)' : 'var(--paper)', border: `1px solid ${sel ? 'rgba(232,57,14,0.4)' : 'var(--border)'}`, padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0, transition: 'all .15s' }}>
                      {sel ? 'Remove' : 'Add'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MIDDLE — Preview */}
        <div className={`rb-panel${activeTab === 'list' ? ' show' : ''}`} style={{ background: 'var(--ink2)' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, color: 'var(--paper)', flexShrink: 0, letterSpacing: '1px' }}>Preview</div>
          {!preview ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faded)', fontSize: '11px' }}>
              Click a section to preview
            </div>
          ) : (
            <div className="rb-scroll" style={{ padding: '16px' }}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)', letterSpacing: '2px' }}>{preview.courseCode} - {preview.sectionName}</div>
                <div style={{ fontSize: '12px', color: 'var(--paper)', fontWeight: 700, marginTop: '2px' }}>{preview.courseName}</div>
                <div style={{ fontSize: '10px', color: 'var(--bronze)', marginTop: '4px' }}>{preview.faculties} · {preview.courseCredit} credits</div>
                <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>Updated from USIS CDN</div>
              </div>

              {/* Schedule */}
              {preview.sectionSchedule?.classSchedules && preview.sectionSchedule.classSchedules.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>CLASS SCHEDULE</div>
                  {preview.sectionSchedule.classSchedules.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '11px' }}>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>{DAY_SHORT[s.day] || s.day}</span>
                      <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Room */}
              {preview.roomName && (
                <div style={{ marginBottom: '14px', fontSize: '11px', color: 'var(--faded)' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px', fontWeight: 700 }}>ROOM</div>
                  📍 {preview.roomName}
                </div>
              )}

              {/* Seats */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>SEATS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {[
                    { label: 'Remaining', val: preview.availableSeats, color: getAvailColor(preview.availableSeats, preview.capacity) },
                    { label: 'Booked', val: preview.consumedSeat, color: 'var(--bronze)' },
                    { label: 'Total', val: preview.capacity, color: 'var(--paper)' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--ink)', border: '1px solid var(--border)' }}>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: s.color, letterSpacing: '1px' }}>{s.val}</div>
                      <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(242,237,228,0.06)', height: '4px', marginTop: '8px' }}>
                  <div style={{ height: '100%', background: getAvailColor(preview.availableSeats, preview.capacity), width: `${preview.capacity > 0 ? (preview.consumedSeat / preview.capacity) * 100 : 0}%` }} />
                </div>
              </div>

              {/* Exam dates */}
              {(preview.sectionSchedule?.midExamDetail || preview.sectionSchedule?.finalExamDetail) && (
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>EXAM DATES</div>
                  {preview.sectionSchedule?.midExamDetail && (
                    <div style={{ padding: '6px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '10px', display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--bronze)', flexShrink: 0 }}>Mid</span>
                      <span style={{ color: 'var(--paper)' }}>{preview.sectionSchedule.midExamDetail}</span>
                    </div>
                  )}
                  {preview.sectionSchedule?.finalExamDetail && (
                    <div style={{ padding: '6px 0', fontSize: '10px', display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--red)', flexShrink: 0 }}>Final</span>
                      <span style={{ color: 'var(--paper)' }}>{preview.sectionSchedule.finalExamDetail}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Conflict warning */}
              {conflictsWithSelected(preview) && !isSelected(preview) && (
                <div style={{ marginTop: '14px', background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.3)', padding: '10px 12px', fontSize: '10px', color: 'var(--red)' }}>
                  ⚠️ This section conflicts with a selected course
                </div>
              )}

              <button
                onClick={() => isSelected(preview) ? removeSection(preview) : addSection(preview)}
                style={{ width: '100%', marginTop: '16px', background: isSelected(preview) ? 'rgba(232,57,14,0.1)' : 'var(--red)', color: isSelected(preview) ? 'var(--red)' : 'var(--paper)', border: `1px solid ${isSelected(preview) ? 'rgba(232,57,14,0.4)' : 'var(--red)'}`, padding: '10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                {isSelected(preview) ? 'Remove Section' : 'Add Section →'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Selected */}
        <div className={`rb-panel${activeTab === 'list' ? ' show' : ''}`} style={{ background: 'var(--ink)' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', letterSpacing: '1px' }}>Selected</div>
            <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700 }}>{totalCredits} credits</div>
          </div>
          {selected.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faded)', fontSize: '10px', padding: '20px', textAlign: 'center' }}>
              No sections selected.<br />Add from the list.
            </div>
          ) : (
            <div className="rb-scroll">
              {selected.map(s => (
                <div key={s.sectionId} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '2px' }}>{s.courseCode} - {s.sectionName}</div>
                      <div style={{ fontSize: '9px', color: 'var(--bronze)' }}>{s.faculties}</div>
                      <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>
                        {s.sectionSchedule?.classSchedules?.map(c => `${DAY_SHORT[c.day]} ${formatTime(c.startTime)}`).join(' · ')}
                      </div>
                      <div style={{ fontSize: '9px', color: getAvailColor(s.availableSeats, s.capacity), marginTop: '2px' }}>
                        {s.availableSeats} seats left
                      </div>
                    </div>
                    <button onClick={() => removeSection(s)}
                      style={{ background: 'rgba(232,57,14,0.1)', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.3)', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0 }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selected.length > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center', padding: '6px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--red)' }}>{totalCredits}</div>
                  <div style={{ fontSize: '8px', color: 'var(--faded)', textTransform: 'uppercase', letterSpacing: '1px' }}>Credits</div>
                </div>
                <div style={{ textAlign: 'center', padding: '6px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)' }}>{selected.length}</div>
                  <div style={{ fontSize: '8px', color: 'var(--faded)', textTransform: 'uppercase', letterSpacing: '1px' }}>Courses</div>
                </div>
              </div>
              <button onClick={() => setSelected([])}
                style={{ width: '100%', background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '7px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TIMETABLE */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '2px' }}>CLASS TIMETABLE</div>
          <div style={{ fontSize: '10px', color: 'var(--faded)' }}>{totalCredits} credits · {selected.length} courses</div>
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
          <table className="tt-grid" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Time</th>
                {DAYS.map(d => <th key={d}>{DAY_SHORT[d]}</th>)}
              </tr>
            </thead>
            <tbody>
              {sortedTimes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink)' }}>
                    No sections selected. Add sections from the list above.
                  </td>
                </tr>
              ) : sortedTimes.map(timeKey => {
                const [start, end] = timeKey.split('-')
                return (
                  <tr key={timeKey}>
                    <td style={{ fontSize: '9px', color: 'var(--faded)', textAlign: 'center', padding: '6px 4px', background: 'var(--ink2)', whiteSpace: 'nowrap' }}>
                      {formatTime(start)}<br />– {formatTime(end)}
                    </td>
                    {DAYS.map(day => {
                      const s = timetableSlots[timeKey]?.[day]
                      return (
                        <td key={day}>
                          {s && (
                            <div className="tt-cell">
                              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--red)', letterSpacing: '.5px' }}>{s.courseCode}</div>
                              <div style={{ fontSize: '8px', color: 'var(--faded)', marginTop: '1px' }}>{s.sectionName}</div>
                              <div style={{ fontSize: '8px', color: 'var(--bronze)', marginTop: '1px' }}>{s.faculties}</div>
                              {s.roomName && <div style={{ fontSize: '7px', color: 'var(--dim)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.roomName.split(';')[0]}</div>}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXAM SCHEDULE */}
      <div style={{ marginTop: '24px', marginBottom: '32px' }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '12px' }}>EXAM SCHEDULE</div>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
          <table className="tt-grid" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th>Section</th>
                <th>Mid Date & Time</th>
                <th>Final Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {selected.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink)' }}>
                    No courses selected.
                  </td>
                </tr>
              ) : selected.map(s => (
                <tr key={s.sectionId}>
                  <td style={{ background: 'var(--ink)', padding: '8px 10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)' }}>{s.courseCode} - {s.sectionName}</div>
                    <div style={{ fontSize: '9px', color: 'var(--bronze)' }}>{s.faculties}</div>
                  </td>
                  <td style={{ background: 'var(--ink)', padding: '8px 10px', fontSize: '10px', color: 'var(--faded)' }}>
                    {s.sectionSchedule?.midExamDetail || '—'}
                  </td>
                  <td style={{ background: 'var(--ink)', padding: '8px 10px', fontSize: '10px', color: 'var(--faded)' }}>
                    {s.sectionSchedule?.finalExamDetail || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  )
}