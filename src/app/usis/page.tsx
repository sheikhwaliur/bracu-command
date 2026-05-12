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
  return schedules.map(s => `${s.day.slice(0, 3)} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`).join('\n')
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
          courseType: c.courseType || '',
          sectionSchedule: c.sectionSchedule,
        }))
      setCourses(normalized)
      setLastRefresh(Date.now())
      setCountdown(30)
    } catch {
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

  // Lock body scroll when modal open on mobile
  useEffect(() => {
    if (selected && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selected, isMobile])

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

  // Detail panel content — shared between modal and desktop panel
  const DetailContent = ({ c }: { c: Course }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: 'var(--red)', letterSpacing: '2px', lineHeight: 1 }}>{c.courseCode}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginTop: '4px' }}>{c.courseName}</div>
      </div>

      {/* Faculty + Section */}
      <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>FACULTY & SECTION</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '28px' }}>👤</div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--bronze)', letterSpacing: '1px' }}>{c.faculties}</div>
            <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '2px' }}>
              Section: <span style={{ color: 'var(--paper)', fontWeight: 700 }}>{c.sectionName}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--faded)' }}>
              Type: <span style={{ color: 'var(--paper)' }}>{c.courseType}</span> · {c.courseCredit}cr
            </div>
          </div>
        </div>
      </div>

      {/* Seats */}
      <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>SEAT AVAILABILITY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          {[
            { label: 'Capacity', val: c.capacity, color: 'var(--paper)' },
            { label: 'Booked', val: c.consumedSeat, color: 'var(--bronze)' },
            { label: 'Available', val: c.availableSeats, color: getAvailColor(c.availableSeats, c.capacity) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px 4px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '26px', color: s.color, letterSpacing: '1px' }}>{s.val}</div>
              <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(242,237,228,0.06)', height: '6px' }}>
          <div style={{ height: '100%', background: getAvailColor(c.availableSeats, c.capacity), width: `${c.capacity > 0 ? (c.consumedSeat / c.capacity) * 100 : 0}%`, transition: 'width .3s' }} />
        </div>
      </div>

      {/* Schedule */}
      {c.sectionSchedule?.classSchedules && c.sectionSchedule.classSchedules.length > 0 && (
        <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>CLASS SCHEDULE</div>
          {c.sectionSchedule.classSchedules.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '12px' }}>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>{s.day}</span>
              <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
            </div>
          ))}
          {c.roomName && (
            <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '10px' }}>📍 {c.roomName}</div>
          )}
        </div>
      )}

      {/* Exam dates */}
      {(c.sectionSchedule?.midExamDetail || c.sectionSchedule?.finalExamDetail) && (
        <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>EXAM DATES</div>
          {c.sectionSchedule?.midExamDetail && (
            <div style={{ padding: '7px 0', borderBottom: '1px solid rgba(242,237,228,0.05)', fontSize: '11px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: 'var(--bronze)', flexShrink: 0 }}>Midterm</span>
              <span style={{ color: 'var(--paper)', textAlign: 'right' }}>{c.sectionSchedule.midExamDetail}</span>
            </div>
          )}
          {c.sectionSchedule?.finalExamDetail && (
            <div style={{ padding: '7px 0', fontSize: '11px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: 'var(--red)', flexShrink: 0 }}>Final</span>
              <span style={{ color: 'var(--paper)', textAlign: 'right' }}>{c.sectionSchedule.finalExamDetail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <PageLayout
      eyebrow="Live USIS Seat Data"
      title="Check seats.<br/>Plan your routine."
      subtitle="Real-time course seat availability from BRACU USIS. Tap any course for full details."
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .usis-row { display: grid; grid-template-columns: 80px 1fr 50px; gap: 0; align-items: center; padding: 12px 14px; cursor: crosshair; }
        @media(min-width: 640px) {
          .usis-row { grid-template-columns: 90px 1fr 70px 100px 60px 60px !important; }
          .usis-hide { display: block !important; }
          .usis-head { display: grid !important; }
        }
        .usis-hide { display: none; }
        .usis-head { display: none; grid-template-columns: 90px 1fr 70px 100px 60px 60px; gap: 0; padding: 8px 14px; }
      `}</style>

      {/* Live status */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', fontWeight: 700 }}>{loading ? 'FETCHING...' : 'LIVE'}</span>
        </div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--paper)', letterSpacing: '3px' }}>00:{String(countdown).padStart(2, '0')}</div>
        {lastRefresh > 0 && <div style={{ fontSize: '10px', color: 'var(--faded)', flex: 1 }}>Last refresh: <span style={{ color: 'var(--paper)' }}>{new Date(lastRefresh).toLocaleTimeString()}</span></div>}
        <button onClick={fetchData} disabled={loading}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '7px 16px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'wait' : 'crosshair', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', padding: '12px 18px', marginBottom: '14px', fontSize: '11px', color: 'var(--red)' }}>⚠️ {error}</div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', marginBottom: '16px' }}>
        {[
          { label: 'Total Sections', val: courses.length, color: 'var(--paper)' },
          { label: 'Available Seats', val: totalAvailable, color: '#5fd49a' },
          { label: 'Booked Seats', val: totalBooked, color: 'var(--bronze)' },
          { label: 'Full Sections', val: fullCourses, color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '12px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(16px,4vw,28px)', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{loading ? '—' : s.val}</div>
            <div style={{ fontSize: '7px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px', lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <input
          style={{ flex: 1, minWidth: '160px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 14px', outline: 'none' }}
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
            style={{ flex: 1, padding: '9px 4px', background: filter === f ? 'var(--red)' : 'var(--ink2)', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && courses.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px', display: 'flex', gap: '12px', opacity: 1 - i * 0.12 }}>
              <div style={{ width: '70px', height: '12px', background: 'rgba(242,237,228,0.06)' }} />
              <div style={{ flex: 1, height: '12px', background: 'rgba(242,237,228,0.04)' }} />
              <div style={{ width: '40px', height: '20px', background: 'rgba(242,237,228,0.06)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Desktop: split layout | Mobile: full list + modal */}
      {!loading && courses.length > 0 && (
        <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: selected && !isMobile ? '1fr 320px' : '1fr', gap: '2px', background: selected && !isMobile ? 'var(--border)' : 'transparent' }}>

          {/* Course list */}
          <div>
            <div className="usis-head" style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderBottom: 'none', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}>
              <div>Code</div>
              <div>Course / Faculty</div>
              <div>Section</div>
              <div className="usis-hide">Schedule</div>
              <div className="usis-hide" style={{ textAlign: 'center' }}>Cap</div>
              <div style={{ textAlign: 'center' }}>Seats</div>
            </div>

            <div style={{ border: '1px solid var(--border)', maxHeight: isMobile ? 'none' : 'calc(100vh - 480px)', minHeight: '300px', overflowY: isMobile ? 'visible' : 'auto' }}>
              {filtered.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink)' }}>No courses found</div>
              )}
              {filtered.map((c, i) => {
                const availColor = getAvailColor(c.availableSeats, c.capacity)
                const isSelected = selected?.sectionId === c.sectionId
                return (
                  <div key={`${c.sectionId}-${i}`}
                    className="usis-row"
                    onClick={() => setSelected(isSelected ? null : c)}
                    style={{ background: isSelected ? 'var(--ink2)' : 'var(--ink)', borderBottom: '1px solid var(--border)', transition: 'background .1s', borderLeft: `3px solid ${isSelected ? 'var(--red)' : 'transparent'}` }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--ink2)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--ink)' }}>

                    {/* Code */}
                    <div>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--red)', letterSpacing: '1px' }}>{c.courseCode}</div>
                      <div style={{ fontSize: '9px', color: 'var(--faded)' }}>{c.courseCredit}cr</div>
                    </div>

                    {/* Course + Faculty */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: 'var(--paper)', marginBottom: '2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.courseName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--bronze)', fontWeight: 700 }}>👤 {c.faculties}</div>
                    </div>

                    {/* Section — hidden on mobile */}
                    <div className="usis-hide" style={{ fontSize: '10px', color: 'var(--faded)' }}>
                      <span style={{ border: '1px solid var(--border)', padding: '2px 5px', fontSize: '9px' }}>{c.sectionName}</span>
                    </div>

                    {/* Schedule — hidden on mobile */}
                    <div className="usis-hide" style={{ fontSize: '9px', color: 'var(--faded)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {formatSchedule(c.sectionSchedule?.classSchedules)}
                    </div>

                    {/* Capacity — hidden on mobile */}
                    <div className="usis-hide" style={{ textAlign: 'center', fontSize: '11px', color: 'var(--faded)' }}>{c.capacity}</div>

                    {/* Available */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: availColor, letterSpacing: '1px', lineHeight: 1 }}>
                        {c.availableSeats === 0 ? 'FULL' : c.availableSeats}
                      </div>
                      {c.availableSeats > 0 && <div style={{ fontSize: '7px', color: 'var(--faded)', textTransform: 'uppercase', letterSpacing: '1px' }}>left</div>}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '8px 0', fontSize: '10px', color: 'var(--faded)', textAlign: 'right' }}>
              Showing {filtered.length} of {courses.length} sections
            </div>
          </div>

          {/* Desktop detail panel */}
          {selected && !isMobile && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}>SECTION DETAILS</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '16px', cursor: 'crosshair' }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                <DetailContent c={selected} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* MOBILE MODAL — bottom sheet */}
      {selected && isMobile && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(12,11,9,0.85)', zIndex: 900, backdropFilter: 'blur(4px)' }}
          />
          {/* Bottom sheet */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--ink2)', border: '1px solid var(--border)', borderBottom: 'none', zIndex: 901, maxHeight: '85vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s ease-out' }}>
            {/* Handle + close */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '40px', height: '4px', background: 'rgba(242,237,228,0.15)', borderRadius: '2px', margin: '0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '8px' }} />
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}>SECTION DETAILS</div>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', fontSize: '14px', cursor: 'crosshair', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace' }}>
                ✕ Close
              </button>
            </div>
            {/* Scrollable content */}
            <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }}>
              <DetailContent c={selected} />
            </div>
          </div>
        </>
      )}

      {/* Source note */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px 18px', marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8 }}>
          Data from <span style={{ color: 'var(--bronze)' }}>usis-cdn.eniamza.com</span> — auto-refreshes every 30s. Always verify on USIS before registering.
        </p>
      </div>
    </PageLayout>
  )
}