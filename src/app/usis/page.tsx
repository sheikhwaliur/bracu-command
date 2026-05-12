'use client'
import { useState, useEffect, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Course {
  code: string
  title: string
  section: string
  faculty: string
  capacity: number
  booked: number
  available: number
  schedule: string
  lab?: string
  exam?: string
}

interface Meta {
  updated: string
  semester: string
  totalCourses: number
  source: string
  stale: boolean
}

const CDN_URL = 'https://usis-cdn.eniamza.com/connect.json'

export default function USISPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'full'>('all')
  const [sort, setSort] = useState<'code' | 'available' | 'booked'>('code')
  const [lastRefresh, setLastRefresh] = useState(0)
  const [countdown, setCountdown] = useState(30)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${CDN_URL}?t=${Date.now()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const raw = await res.json()

      // Handle both flat array and nested {courses, meta} format
      let courseList: any[] = []
      let metaInfo: Meta | null = null

      if (Array.isArray(raw)) {
        courseList = raw
      } else if (raw.courses) {
        courseList = raw.courses
        metaInfo = raw.meta || null
      } else if (raw.data) {
        courseList = raw.data
      }

      // Normalize course fields
      const normalized: Course[] = courseList
        .filter((c: any) => c && (c.code || c.courseCode || c.course_code))
        .map((c: any) => ({
          code: c.code || c.courseCode || c.course_code || '',
          title: c.title || c.courseName || c.course_name || c.name || '',
          section: c.section || c.sectionNo || c.section_no || '',
          faculty: c.faculty || c.facultyName || c.faculty_name || c.instructor || '',
          capacity: Number(c.capacity || c.totalSeats || c.total_seats || 0),
          booked: Number(c.booked || c.bookedSeats || c.booked_seats || c.enrolled || 0),
          available: Number(c.available || c.availableSeats || c.available_seats || 0),
          schedule: c.schedule || c.classTime || c.class_time || c.time || '',
          lab: c.lab || c.labTime || '',
          exam: c.exam || c.examTime || '',
        }))

      setCourses(normalized)
      setMeta(metaInfo)
      setLastRefresh(Date.now())
      setCountdown(30)
    } catch (err) {
      setError('Could not fetch live seat data. Retrying...')
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
    const timer = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { return 30 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [lastRefresh])

  const filtered = courses
    .filter(c => {
      if (filter === 'available') return c.available > 0
      if (filter === 'full') return c.available === 0
      return true
    })
    .filter(c => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        c.code.toLowerCase().includes(s) ||
        c.title.toLowerCase().includes(s) ||
        c.faculty.toLowerCase().includes(s) ||
        c.section.toLowerCase().includes(s)
      )
    })
    .sort((a, b) => {
      if (sort === 'available') return b.available - a.available
      if (sort === 'booked') return b.booked - a.booked
      return a.code.localeCompare(b.code)
    })

  const totalAvailable = courses.reduce((a, c) => a + c.available, 0)
  const totalBooked = courses.reduce((a, c) => a + c.booked, 0)
  const fullCourses = courses.filter(c => c.available === 0).length

  const getAvailColor = (available: number, capacity: number) => {
    if (available === 0) return 'var(--red)'
    if (capacity > 0 && available / capacity < 0.2) return 'var(--bronze)'
    return '#5fd49a'
  }

  const timeSince = lastRefresh
    ? Math.floor((Date.now() - lastRefresh) / 1000)
    : null

  return (
    <PageLayout
      eyebrow="Live USIS Seat Data"
      title="Check seats.<br/>Plan your routine."
      subtitle="Real-time course seat availability from BRACU USIS. Refreshes every 30 seconds."
    >
      {/* Live status bar */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: loading ? 'var(--bronze)' : error ? 'var(--red)' : 'var(--red)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: loading ? 'var(--bronze)' : error ? 'var(--red)' : 'var(--red)', fontWeight: 700 }}>
            {loading ? 'FETCHING...' : error ? 'ERROR' : 'LIVE CDN'}
          </span>
        </div>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: 'var(--paper)', letterSpacing: '3px', lineHeight: 1 }}>
          00:{String(countdown).padStart(2, '0')}
        </div>
        <div style={{ flex: 1, fontSize: '10px', color: 'var(--faded)', letterSpacing: '.5px' }}>
          {meta?.semester && <span>Semester: <span style={{ color: 'var(--paper)' }}>{meta.semester}</span> · </span>}
          {meta?.updated && <span>Updated: <span style={{ color: 'var(--paper)' }}>{new Date(meta.updated).toLocaleTimeString()}</span></span>}
          {!meta && lastRefresh > 0 && <span>Last refresh: <span style={{ color: 'var(--paper)' }}>{new Date(lastRefresh).toLocaleTimeString()}</span></span>}
        </div>
        <button onClick={fetchData} disabled={loading}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '7px 16px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'wait' : 'crosshair', opacity: loading ? 0.6 : 1, flexShrink: 0 }}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.25)', padding: '14px 18px', marginBottom: '16px', fontSize: '11px', color: 'var(--red)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>⚠️</span>
          <span>{error} Data shown may be from last successful fetch.</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        {[
          { label: 'Total Courses', val: courses.length, color: 'var(--paper)' },
          { label: 'Available Seats', val: totalAvailable, color: '#5fd49a' },
          { label: 'Booked Seats', val: totalBooked, color: 'var(--bronze)' },
          { label: 'Full Sections', val: fullCourses, color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(20px,4vw,32px)', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{loading ? '—' : s.val}</div>
            <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px', lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 14px', outline: 'none' }}
          placeholder="Search by course code, title, faculty..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 12px', outline: 'none' }}>
          <option value="code">Sort: Code</option>
          <option value="available">Most Available</option>
          <option value="booked">Most Booked</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
        {([
          ['all', `All (${courses.length})`],
          ['available', `Available (${courses.filter(c => c.available > 0).length})`],
          ['full', `Full (${fullCourses})`],
        ] as const).map(([f, l]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ flex: 1, padding: '9px', background: filter === f ? 'var(--red)' : 'var(--ink2)', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && courses.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', opacity: 1 - i * 0.1 }}>
              <div style={{ width: '60px', height: '14px', background: 'rgba(242,237,228,0.06)', borderRadius: '2px' }} />
              <div style={{ flex: 1, height: '14px', background: 'rgba(242,237,228,0.04)', borderRadius: '2px' }} />
              <div style={{ width: '40px', height: '24px', background: 'rgba(242,237,228,0.06)', borderRadius: '2px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Course table */}
      {!loading && courses.length > 0 && (
        <>
          {/* Desktop header */}
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px 100px 80px 60px 70px', gap: '0', padding: '10px 16px', background: 'var(--ink2)', border: '1px solid var(--border)', borderBottom: 'none', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', fontWeight: 700 }}
            className="usis-header">
            <div>Code</div>
            <div>Title / Faculty</div>
            <div>Section</div>
            <div>Schedule</div>
            <div style={{ textAlign: 'center' }}>Capacity</div>
            <div style={{ textAlign: 'center' }}>Booked</div>
            <div style={{ textAlign: 'center' }}>Available</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink)' }}>
                No courses found for "{search}"
              </div>
            )}
            {filtered.map((c, i) => {
              const availColor = getAvailColor(c.available, c.capacity)
              const pct = c.capacity > 0 ? (c.booked / c.capacity) * 100 : 0
              return (
                <div key={`${c.code}-${c.section}-${i}`}
                  style={{ background: 'var(--ink)', padding: '12px 16px', transition: 'background .1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

                  {/* Mobile layout */}
                  <style>{`
                    .usis-header { display: none !important; }
                    @media(min-width: 768px) {
                      .usis-header { display: grid !important; }
                      .usis-mobile { display: none !important; }
                      .usis-desktop { display: grid !important; }
                    }
                  `}</style>

                  {/* Mobile card */}
                  <div className="usis-mobile">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--red)', letterSpacing: '1px' }}>{c.code}</span>
                          {c.section && <span style={{ fontSize: '9px', color: 'var(--faded)', border: '1px solid var(--border)', padding: '1px 6px', letterSpacing: '1px' }}>Sec {c.section}</span>}
                        </div>
                        {c.title && <div style={{ fontSize: '11px', color: 'var(--faded)', marginBottom: '2px' }}>{c.title}</div>}
                        {c.faculty && <div style={{ fontSize: '10px', color: 'var(--bronze)' }}>{c.faculty}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: availColor, letterSpacing: '2px', lineHeight: 1 }}>
                          {c.available === 0 ? 'FULL' : c.available}
                        </div>
                        <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {c.available === 0 ? 'no seats' : 'available'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--faded)', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {c.schedule && <span>🕐 {c.schedule}</span>}
                      {c.capacity > 0 && <span>👥 {c.booked}/{c.capacity}</span>}
                    </div>
                    {c.capacity > 0 && (
                      <div style={{ background: 'rgba(242,237,228,0.06)', height: '3px' }}>
                        <div style={{ height: '100%', background: availColor, width: `${Math.min(100, pct)}%`, transition: 'width .3s' }} />
                      </div>
                    )}
                  </div>

                  {/* Desktop row */}
                  <div className="usis-desktop" style={{ display: 'none', gridTemplateColumns: '100px 1fr 80px 100px 80px 60px 70px', gap: '0', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '15px', color: 'var(--red)', letterSpacing: '1px' }}>{c.code}</div>
                    <div>
                      {c.title && <div style={{ fontSize: '11px', color: 'var(--paper)', marginBottom: '2px', lineHeight: 1.3 }}>{c.title}</div>}
                      {c.faculty && <div style={{ fontSize: '10px', color: 'var(--faded)' }}>{c.faculty}</div>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--faded)' }}>{c.section || '—'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.5 }}>{c.schedule || '—'}</div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--faded)' }}>{c.capacity || '—'}</div>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--bronze)' }}>{c.booked || '—'}</div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: availColor, letterSpacing: '1px' }}>
                        {c.available === 0 ? 'FULL' : c.available}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Result count */}
          <div style={{ padding: '10px 0', fontSize: '10px', color: 'var(--faded)', letterSpacing: '1px', textAlign: 'right' }}>
            Showing {filtered.length} of {courses.length} courses
          </div>
        </>
      )}

      {/* Info */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '16px 20px', marginTop: '16px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>DATA SOURCE</div>
        <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
          Seat data is fetched from <span style={{ color: 'var(--bronze)' }}>usis-cdn.eniamza.com</span> — a public CDN that scrapes BRACU USIS every few minutes. Data may be 2–5 minutes behind actual USIS. Always verify on USIS before registering.
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </PageLayout>
  )
}