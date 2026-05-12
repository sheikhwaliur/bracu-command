'use client'
import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Course {
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
  preRegSchedule: string
  courseType: string
  sectionSchedule?: {
    finalExamDetail?: string
    midExamDetail?: string
    classSchedules?: { startTime: string; endTime: string; day: string }[]
  }
}

const CDN_URL = 'https://usis-cdn.eniamza.com/connect.json'

const formatTime = (t: string) => {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const formatSchedule = (schedules?: { startTime: string; endTime: string; day: string }[]) => {
  if (!schedules || schedules.length === 0) return '—'
  return schedules.map(s => `${s.day.slice(0, 3)} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`).join(' | ')
}

export default function USISPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'full'>('all')
  const [sort, setSort] = useState<'code' | 'available' | 'faculty'>('code')
  const [selected, setSelected] = useState<Course | null>(null)
  const [lastRefresh, setLastRefresh] = useState(0)
  const [countdown, setCountdown] = useState(30)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${CDN_URL}?t=${Date.now()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const raw = await res.json()

      const list = Array.isArray(raw) ? raw : raw.courses || raw.data || []

      const normalized: Course[] = list
        .filter((c: any) => c && c.courseCode)
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
          preRegSchedule: c.preRegSchedule || '',
          courseType: c.courseType || '',
          sectionSchedule: c.sectionSchedule,
        }))

      setCourses(normalized)
      setLastRefresh(Date.now())
      setCountdown(30)
    } catch (err) {
      setError('Could not fetch live seat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    const timer = setInterval(() => setCountdown(p => p <= 1 ? 30 : p - 1), 1000)
    return () => clearInterval(timer)
  }, [lastRefresh])

  const filtered = courses
    .filter(c => {
      if (filter === 'available') return c.availableSeats > 0
      if (filter === 'full') return c.availableSeats === 0
      return true
    })
    .filter(c => {
      if (!search) return true
      const s = search.toLowerCase()
      return c.courseCode.toLowerCase().includes(s) ||
        c.courseName.toLowerCase().includes(s) ||
        c.faculties.toLowerCase().includes(s) ||
        c.sectionName.toLowerCase().includes(s)
    })
    .sort((a, b) => {
      if (sort === 'available') return b.availableSeats - a.availableSeats
      if (sort === 'faculty') return a.faculties.localeCompare(b.faculties)
      return a.courseCode.localeCompare(b.courseCode)
    })

  const totalAvailable = courses.reduce((a, c) => a + c.availableSeats, 0)
  const totalBooked = courses.reduce((a, c) => a + c.consumedSeat, 0)
  const fullCourses = courses.filter(c => c.availableSeats === 0).length

  const getAvailColor = (available: number, capacity: number) => {
    if (available === 0) return 'var(--red)'
    if (capacity > 0 && available / capacity < 0.2) return 'var(--bronze)'
    return '#5fd49a'
  }

  return (
    <PageLayout
      eyebrow="Live USIS Seat Data"
      title="Check seats.<br/>Plan your routine."
      subtitle="Real-time course seat availability from BRACU USIS. Faculty, section, schedule — everything."
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .usis-row { display: grid; grid-template-columns: 90px 1fr 70px 80px 60px 60px; gap: 0; align-items: center; padding: 10px 14px; }
        .usis-head { display: grid; grid-template-columns: 90px 1fr 70px 80px 60px 60px; gap: 0; padding: 8px 14px; }
        .usis-col-hide { display: table-cell; }
        @media(max-width: 640px) {
          .usis-row { grid-template-columns: 80px 1fr 50px !important; }
          .usis-head { display: none !important; }
          .usis-col-hide { display: none !important; }
        }
      `}</style>

      {/* Live status bar */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? 'var(--bronze)' : 'var(--red)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: loading ? 'var(--bronze)' : 'var(--red)', fontWeight: 700 }}>
            {loading ? 'FETCHING...' : 'LIVE'}
          </span>
        </div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--paper)', letterSpacing: '3px', lineHeight: 1 }}>
          00:{String(countdown).padStart(2, '0')}
        </div>
        {lastRefresh > 0 && (
          <div style={{ fontSize: '10px', color: 'var(--faded)' }}>
            Last refresh: <span style={{ color: 'var(--paper)' }}>{new Date(lastRefresh).toLocaleTimeString()}</span>
          </div>
        )}
        <button onClick={fetchData} disabled={loading}
          style={{ marginLeft: 'auto', background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '6px 14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'wait' : 'crosshair', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', padding: '12px 18px', marginBottom: '14px', fontSize: '11px', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '16px' }}>
        {[
          { label: 'Total Sections', val: courses.length, color: 'var(--paper)' },
          { label: 'Available Seats', val: totalAvailable, color: '#5fd49a' },
          { label: 'Booked Seats', val: totalBooked, color: 'var(--bronze)' },
          { label: 'Full Sections', val: fullCourses, color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(18px,4vw,28px)', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{loading ? '—' : s.val}</div>
            <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px', lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <input
          style={{ flex: 1, minWidth: '180px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 14px', outline: 'none' }}
          placeholder="Search course, faculty, section..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 10px', outline: 'none' }}>
          <option value="code">Sort: Code</option>
          <option value="available">Most Available</option>
          <option value="faculty">Faculty A→Z</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
        {([
          ['all', `All (${courses.length})`],
          ['available', `Available (${courses.filter(c => c.availableSeats > 0).length})`],
          ['full', `Full (${fullCourses})`],
        ] as const).map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ flex: 1, padding: '8px', background: filter === f ? 'var(--red)' : 'var(--ink2)', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && courses.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px', display: 'flex', gap: '12px', opacity: 1 - i * 0.1 }}>
              <div style={{ width: '70px', height: '12px', background: 'rgba(242,237,228,0.06)' }} />
              <div style={{ flex: 1, height: '12px', background: 'rgba(242,237,228,0.04)' }} />
              <div style={{ width: '40px', height: '20px', background: 'rgba(242,237,228,0.06)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Course list + detail panel */}
      {!loading && courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '2px', background: selected ? 'var(--border)' : 'transparent' }}>

          {/* List */}
          <div>
            {/* Desktop header */}
            <div className="usis-head" style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderBottom: 'none', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}>
              <div>Code</div>
              <div>Course / Faculty</div>
              <div>Section</div>
              <div className="usis-col-hide">Schedule</div>
              <div className="usis-col-hide" style={{ textAlign: 'center' }}>Cap</div>
              <div style={{ textAlign: 'center' }}>Seats</div>
            </div>

            <div style={{ border: '1px solid var(--border)', maxHeight: 'calc(100vh - 480px)', minHeight: '300px', overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink)' }}>
                  No courses found for "{search}"
                </div>
              )}
              {filtered.map((c, i) => {
                const availColor = getAvailColor(c.availableSeats, c.capacity)
                const isSelected = selected?.sectionId === c.sectionId
                return (
                  <div key={`${c.sectionId}-${i}`}
                    className="usis-row"
                    onClick={() => setSelected(isSelected ? null : c)}
                    style={{ background: isSelected ? 'var(--ink2)' : 'var(--ink)', borderBottom: '1px solid var(--border)', cursor: 'crosshair', transition: 'background .1s', borderLeft: `3px solid ${isSelected ? 'var(--red)' : 'transparent'}` }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--ink2)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--ink)' }}>

                    {/* Code */}
                    <div>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--red)', letterSpacing: '1px' }}>{c.courseCode}</div>
                      <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '.5px' }}>{c.courseCredit}cr</div>
                    </div>

                    {/* Course + Faculty */}
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--paper)', marginBottom: '2px', lineHeight: 1.3 }}>{c.courseName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--bronze)', fontWeight: 700, letterSpacing: '.5px' }}>👤 {c.faculties}</div>
                    </div>

                    {/* Section */}
                    <div style={{ fontSize: '11px', color: 'var(--faded)' }}>
                      <span style={{ border: '1px solid var(--border)', padding: '2px 6px', fontSize: '9px', letterSpacing: '1px' }}>{c.sectionName || '—'}</span>
                    </div>

                    {/* Schedule — hidden on mobile */}
                    <div className="usis-col-hide" style={{ fontSize: '9px', color: 'var(--faded)', lineHeight: 1.6 }}>
                      {formatSchedule(c.sectionSchedule?.classSchedules)}
                    </div>

                    {/* Capacity — hidden on mobile */}
                    <div className="usis-col-hide" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--faded)' }}>
                      {c.capacity || '—'}
                    </div>

                    {/* Available seats */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: availColor, letterSpacing: '1px', lineHeight: 1 }}>
                        {c.availableSeats === 0 ? 'FULL' : c.availableSeats}
                      </div>
                      <div style={{ fontSize: '8px', color: 'var(--faded)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {c.availableSeats === 0 ? '' : 'left'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '8px 0', fontSize: '10px', color: 'var(--faded)', letterSpacing: '1px', textAlign: 'right' }}>
              Showing {filtered.length} of {courses.length} sections
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)', letterSpacing: '2px' }}>{selected.courseCode}</div>
                  <div style={{ fontSize: '12px', color: 'var(--paper)', fontWeight: 700, marginTop: '2px', lineHeight: 1.3 }}>{selected.courseName}</div>
                </div>
                <button onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '16px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>

                {/* Faculty + Section */}
                <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>FACULTY & SECTION</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px' }}>👤</div>
                    <div>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--bronze)', letterSpacing: '1px' }}>{selected.faculties}</div>
                      <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '2px' }}>Section: <span style={{ color: 'var(--paper)', fontWeight: 700 }}>{selected.sectionName}</span></div>
                      <div style={{ fontSize: '10px', color: 'var(--faded)' }}>Type: <span style={{ color: 'var(--paper)' }}>{selected.courseType}</span></div>
                    </div>
                  </div>
                </div>

                {/* Seat availability */}
                <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>SEAT AVAILABILITY</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {[
                      { label: 'Capacity', val: selected.capacity, color: 'var(--paper)' },
                      { label: 'Booked', val: selected.consumedSeat, color: 'var(--bronze)' },
                      { label: 'Available', val: selected.availableSeats, color: getAvailColor(selected.availableSeats, selected.capacity) },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
                        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: s.color, letterSpacing: '1px' }}>{s.val}</div>
                        <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: 'rgba(242,237,228,0.06)', height: '6px' }}>
                    <div style={{ height: '100%', background: getAvailColor(selected.availableSeats, selected.capacity), width: `${selected.capacity > 0 ? (selected.consumedSeat / selected.capacity) * 100 : 0}%`, transition: 'width .3s' }} />
                  </div>
                </div>

                {/* Schedule */}
                <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>CLASS SCHEDULE</div>
                  {selected.sectionSchedule?.classSchedules?.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '11px' }}>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>{s.day}</span>
                      <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                    </div>
                  ))}
                  {selected.roomName && (
                    <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '8px' }}>📍 {selected.roomName}</div>
                  )}
                </div>

                {/* Exam dates */}
                {(selected.sectionSchedule?.midExamDetail || selected.sectionSchedule?.finalExamDetail) && (
                  <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>EXAM DATES</div>
                    {selected.sectionSchedule?.midExamDetail && (
                      <div style={{ padding: '6px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--bronze)' }}>Midterm</span>
                        <span style={{ color: 'var(--paper)' }}>{selected.sectionSchedule.midExamDetail}</span>
                      </div>
                    )}
                    {selected.sectionSchedule?.finalExamDetail && (
                      <div style={{ padding: '6px 0', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--red)' }}>Final</span>
                        <span style={{ color: 'var(--paper)' }}>{selected.sectionSchedule.finalExamDetail}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source note */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px 18px', marginTop: '16px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px', fontWeight: 700 }}>DATA SOURCE</div>
        <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8 }}>
          Data from <span style={{ color: 'var(--bronze)' }}>usis-cdn.eniamza.com</span> — refreshes every 30 seconds. Always verify on USIS before registering.
        </p>
      </div>
    </PageLayout>
  )
}