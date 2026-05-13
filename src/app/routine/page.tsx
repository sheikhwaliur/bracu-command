
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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
  labSchedules?: ClassSchedule[]
  labFaculties?: string
  labRoomName?: string
  labCourseCode?: string
  sectionSchedule?: {
    finalExamDetail?: string
    midExamDetail?: string
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
        const aStart = timeToMins(as.startTime), aEnd = timeToMins(as.endTime)
        const bStart = timeToMins(bs.startTime), bEnd = timeToMins(bs.endTime)
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
  const [activeTab, setActiveTab] = useState<'courses' | 'timetable' | 'exams'>('courses')
  const [previewModal, setPreviewModal] = useState<Section | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const combinedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
          labSchedules: c.labSchedules || [],
          labFaculties: c.labFaculties || '',
          labRoomName: c.labRoomName || '',
          labCourseCode: c.labCourseCode || '',
          sectionSchedule: c.sectionSchedule,
        }))
      setSections(normalized)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (previewModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [previewModal])

  const totalCredits = selected.reduce((a, s) => a + s.courseCredit, 0)
  const isSelected = (s: Section) => selected.some(x => x.sectionId === s.sectionId)
  const conflictsWithSelected = (s: Section) => selected.some(x => x.sectionId !== s.sectionId && hasConflict(x, s))

  const addSection = (s: Section) => {
    if (isSelected(s)) return
    setSelected(prev => [...prev.filter(x => x.courseCode !== s.courseCode), s])
    setPreview(s)
  }

  const removeSection = (s: Section) => {
    setSelected(p => p.filter(x => x.sectionId !== s.sectionId))
    if (preview?.sectionId === s.sectionId) setPreview(null)
  }

  const downloadCombined = async () => {
    if (!combinedRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const el = combinedRef.current
      const prevWidth = el.style.width
      const prevMaxWidth = el.style.maxWidth
      document.body.style.overflow = 'hidden'
      el.style.width = '900px'
      el.style.maxWidth = '900px'
      const canvas = await html2canvas(el, {
        backgroundColor: '#F2EDE4', scale: 2, useCORS: true, logging: false,
        width: 900, windowWidth: 900,
      })
      document.body.style.overflow = ''
      el.style.width = prevWidth
      el.style.maxWidth = prevMaxWidth
      const link = document.createElement('a')
      link.download = `BRACU-Routine-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) { alert('Download failed. Please try again.') }
    finally { setDownloading(false) }
  }

  const filtered = sections.filter(s => {
    if (availableOnly && s.availableSeats === 0) return false
    if (hideConflicts && conflictsWithSelected(s)) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(s.courseCode.toLowerCase().includes(q) || s.courseName.toLowerCase().includes(q) ||
        s.faculties.toLowerCase().includes(q) || s.sectionName.toLowerCase().includes(q))) return false
    }
    return true
  })

  const timetableSlots: Record<string, Record<string, Section>> = {}
  for (const s of selected) {
    for (const slot of s.sectionSchedule?.classSchedules || []) {
      const key = `${slot.startTime}-${slot.endTime}`
      if (!timetableSlots[key]) timetableSlots[key] = {}
      timetableSlots[key][slot.day] = s
    }
    for (const slot of s.labSchedules || []) {
      const key = `${slot.startTime}-${slot.endTime}`
      if (!timetableSlots[key]) timetableSlots[key] = {}
      if (!timetableSlots[key][slot.day])
        timetableSlots[key][slot.day] = { ...s, courseCode: s.labCourseCode || `${s.courseCode}L`, courseType: 'LAB' }
    }
  }
  const sortedTimes = Object.keys(timetableSlots).sort((a, b) => timeToMins(a.split('-')[0]) - timeToMins(b.split('-')[0]))

  const getAvailColor = (avail: number, cap: number) => {
    if (avail === 0) return 'var(--red)'
    if (cap > 0 && avail / cap < 0.2) return 'var(--bronze)'
    return '#5fd49a'
  }

  const tabBtn = (t: typeof activeTab, label: string) => (
    <button onClick={() => setActiveTab(t)}
      style={{ flex: 1, padding: '10px 6px', background: activeTab === t ? 'var(--red)' : 'var(--ink2)', color: activeTab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
      {label}
    </button>
  )

  // ── DESKTOP 3-PANEL LAYOUT ──
  if (!isMobile) {
    return (
      <PageLayout
        eyebrow="Routine Builder"
        title="Build your routine.<br/>Avoid conflicts."
        subtitle="Live USIS data. Add sections, see your timetable and exam schedule. Download as image."
      >
        <style>{`
          @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
          .tt-table { width: 100%; border-collapse: collapse; min-width: 700px; }
          .tt-table th { background: #E8E0D4; padding: 8px 6px; text-align: center; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #6B5F4E; border: 1px solid #D4CCC0; font-family: IBM Plex Mono,monospace; }
          .tt-table td { border: 1px solid #D4CCC0; padding: 4px; vertical-align: top; min-width: 70px; height: 52px; background: #F2EDE4; }
          .section-row:hover { background: var(--ink2) !important; }
        `}</style>

        {/* 3-panel grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', height: 'calc(100vh - 320px)', minHeight: '500px', marginBottom: '24px' }}>

          {/* LEFT — Section list */}
          <div style={{ background: 'var(--ink)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '10px', letterSpacing: '1px' }}>
                {loading ? 'Loading...' : `${filtered.length} sections`}
              </div>
              <input placeholder="Search course, faculty, section..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '8px 10px', outline: 'none', marginBottom: '8px' }} />
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button onClick={() => setAvailableOnly(p => !p)}
                  style={{ padding: '4px 10px', background: availableOnly ? 'rgba(95,212,154,0.15)' : 'transparent', color: availableOnly ? '#5fd49a' : 'var(--faded)', border: `1px solid ${availableOnly ? 'rgba(95,212,154,0.4)' : 'var(--border)'}`, fontSize: '9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: availableOnly ? '#5fd49a' : 'var(--faded)', display: 'inline-block' }} />Available Now
                </button>
                <button onClick={() => setHideConflicts(p => !p)}
                  style={{ padding: '4px 10px', background: hideConflicts ? 'rgba(0,180,255,0.15)' : 'transparent', color: hideConflicts ? 'var(--red)' : 'var(--faded)', border: `1px solid ${hideConflicts ? 'rgba(0,180,255,0.4)' : 'var(--border)'}`, fontSize: '9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: hideConflicts ? 'var(--red)' : 'var(--faded)', display: 'inline-block' }} />Hide Conflicts
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading && <div style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: 'var(--faded)' }}>Loading live USIS data...</div>}
              {filtered.map(s => {
                const conflict = conflictsWithSelected(s)
                const sel = isSelected(s)
                const availColor = getAvailColor(s.availableSeats, s.capacity)
                const isPreview = preview?.sectionId === s.sectionId
                return (
                  <div key={s.sectionId} className="section-row"
                    onClick={() => setPreview(s)}
                    style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: isPreview ? 'var(--ink2)' : 'var(--ink)', opacity: conflict && !sel ? 0.4 : 1, borderLeft: `3px solid ${sel ? 'var(--red)' : isPreview ? 'rgba(0,180,255,0.3)' : 'transparent'}`, cursor: 'crosshair', transition: 'background .1s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--red)', letterSpacing: '1px' }}>{s.courseCode}</span>
                          <span style={{ fontSize: '9px', border: '1px solid var(--border)', padding: '1px 5px', color: 'var(--faded)' }}>{s.sectionName}</span>
                          <span style={{ fontSize: '9px', color: availColor, fontWeight: 700 }}>({s.availableSeats}/{s.capacity})</span>
                          {s.labSchedules && s.labSchedules.length > 0 && <span style={{ fontSize: '7px', color: '#64b4ff', border: '1px solid rgba(100,180,255,0.3)', padding: '1px 4px' }}>LAB</span>}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--faded)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{s.courseName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--bronze)', fontWeight: 700 }}>👤 {s.faculties}</div>
                        {s.sectionSchedule?.classSchedules && s.sectionSchedule.classSchedules.length > 0 && (
                          <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>
                            {s.sectionSchedule.classSchedules.map(c => `${DAY_SHORT[c.day]} ${formatTime(c.startTime)}`).join(' · ')}
                          </div>
                        )}
                      </div>
                      <button onClick={e => { e.stopPropagation(); sel ? removeSection(s) : addSection(s) }}
                        style={{ background: sel ? 'rgba(0,180,255,0.15)' : 'var(--red)', color: sel ? 'var(--red)' : 'var(--paper)', border: `1px solid ${sel ? 'rgba(0,180,255,0.4)' : 'var(--red)'}`, padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0 }}>
                        {sel ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* MIDDLE — Preview */}
          <div style={{ background: 'var(--ink2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: '10px', fontWeight: 700, color: 'var(--paper)', flexShrink: 0, letterSpacing: '1px' }}>Preview</div>
            {!preview ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faded)', fontSize: '11px', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '28px' }}>👈</div>
                <div>Click a section to preview</div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Header */}
                <div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--red)', letterSpacing: '2px', lineHeight: 1 }}>{preview.courseCode} — {preview.sectionName}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)', marginTop: '4px' }}>{preview.courseName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--bronze)', marginTop: '4px' }}>{preview.faculties} · {preview.courseCredit} credits</div>
                  <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>Updated from USIS CDN</div>
                </div>

                {/* Class Schedule */}
                {preview.sectionSchedule?.classSchedules && preview.sectionSchedule.classSchedules.length > 0 && (
                  <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>CLASS SCHEDULE</div>
                    {preview.sectionSchedule.classSchedules.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,180,255,0.06)', fontSize: '12px' }}>
                        <span style={{ color: 'var(--red)', fontWeight: 700 }}>{s.day}</span>
                        <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                      </div>
                    ))}
                    {preview.roomName && <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '8px' }}>📍 {preview.roomName}</div>}
                  </div>
                )}

                {/* Lab */}
                {preview.labSchedules && preview.labSchedules.length > 0 && (
                  <div style={{ background: 'var(--ink)', border: '1px solid rgba(100,180,255,0.25)', padding: '12px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#64b4ff', marginBottom: '8px', fontWeight: 700 }}>🧪 LAB SCHEDULE</div>
                    <div style={{ fontSize: '10px', color: '#64b4ff', marginBottom: '6px' }}>{preview.labCourseCode} · {preview.labFaculties || 'TBA'}</div>
                    {preview.labSchedules.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(100,180,255,0.1)', fontSize: '12px' }}>
                        <span style={{ color: '#64b4ff', fontWeight: 700 }}>{s.day}</span>
                        <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                      </div>
                    ))}
                    {preview.labRoomName && <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '8px' }}>📍 {preview.labRoomName}</div>}
                  </div>
                )}

                {/* Seats */}
                <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>SEATS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                    {[
                      { label: 'Remaining', val: preview.availableSeats, color: getAvailColor(preview.availableSeats, preview.capacity) },
                      { label: 'Booked', val: preview.consumedSeat, color: 'var(--bronze)' },
                      { label: 'Total', val: preview.capacity, color: 'var(--paper)' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
                        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '8px', color: 'var(--faded)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(0,180,255,0.06)', height: '4px' }}>
                    <div style={{ height: '100%', background: getAvailColor(preview.availableSeats, preview.capacity), width: `${preview.capacity > 0 ? (preview.consumedSeat / preview.capacity) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Exam dates */}
                {(preview.sectionSchedule?.midExamDetail || preview.sectionSchedule?.finalExamDetail) && (
                  <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>EXAM DATES</div>
                    {preview.sectionSchedule?.midExamDetail && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,180,255,0.06)', fontSize: '11px', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ color: 'var(--bronze)' }}>Mid</span>
                        <span style={{ color: 'var(--paper)' }}>{preview.sectionSchedule.midExamDetail}</span>
                      </div>
                    )}
                    {preview.sectionSchedule?.finalExamDetail && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '11px', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ color: 'var(--red)' }}>Final</span>
                        <span style={{ color: 'var(--paper)' }}>{preview.sectionSchedule.finalExamDetail}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Add/Remove button */}
                <button onClick={() => isSelected(preview) ? removeSection(preview) : addSection(preview)}
                  style={{ width: '100%', background: isSelected(preview) ? 'rgba(0,180,255,0.1)' : 'var(--red)', color: isSelected(preview) ? 'var(--red)' : 'var(--paper)', border: `1px solid ${isSelected(preview) ? 'rgba(0,180,255,0.4)' : 'var(--red)'}`, padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                  {isSelected(preview) ? 'Remove from Routine' : 'Add to Routine →'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Selected */}
          <div style={{ background: 'var(--ink)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--paper)', letterSpacing: '1px' }}>Selected</div>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700 }}>{totalCredits} credits</div>
            </div>

            {selected.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faded)', fontSize: '10px', padding: '20px', textAlign: 'center' }}>
                No sections selected.<br />Add from the list.
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {selected.map(s => (
                  <div key={s.sectionId} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '2px' }}>{s.courseCode} - {s.sectionName}</div>
                        <div style={{ fontSize: '9px', color: 'var(--bronze)' }}>{s.faculties}</div>
                        <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>
                          {s.sectionSchedule?.classSchedules?.map(c => `${DAY_SHORT[c.day]} ${formatTime(c.startTime)}`).join(' · ')}
                        </div>
                        <div style={{ fontSize: '9px', color: getAvailColor(s.availableSeats, s.capacity), marginTop: '2px' }}>{s.availableSeats} seats left</div>
                      </div>
                      <button onClick={() => removeSection(s)}
                        style={{ background: 'rgba(0,180,255,0.1)', color: 'var(--red)', border: '1px solid rgba(0,180,255,0.3)', padding: '3px 8px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0 }}>
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
                  <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)' }}>{totalCredits}</div>
                    <div style={{ fontSize: '8px', color: 'var(--faded)', textTransform: 'uppercase', letterSpacing: '1px' }}>Credits</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)' }}>{selected.length}</div>
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

        {/* Timetable + Exam download section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '2px' }}>CLASS TIMETABLE</div>
          {selected.length > 0 && (
            <button onClick={downloadCombined} disabled={downloading}
              style={{ background: downloading ? 'var(--dim)' : 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '8px 18px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: downloading ? 'wait' : 'crosshair' }}>
              {downloading ? '⏳ Saving...' : '⬇ Download Full Routine'}
            </button>
          )}
        </div>

        <div ref={combinedRef} style={{ background: '#F2EDE4', padding: '20px' }}>
          {/* Timetable */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: '#E8390E', letterSpacing: '3px' }}>BRACU/CMD — CLASS TIMETABLE</div>
              <div style={{ fontSize: '10px', color: '#6B5F4E' }}>{totalCredits} credits · {selected.length} courses</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="tt-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Time</th>
                    {DAYS.map(d => <th key={d}>{DAY_SHORT[d]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sortedTimes.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6B5F4E', fontSize: '11px' }}>No sections selected.</td></tr>
                  ) : sortedTimes.map(timeKey => {
                    const [start, end] = timeKey.split('-')
                    return (
                      <tr key={timeKey}>
                        <td style={{ background: '#E8E0D4', padding: '6px 4px', textAlign: 'center', fontSize: '9px', color: '#6B5F4E', fontFamily: 'IBM Plex Mono,monospace', whiteSpace: 'nowrap' }}>
                          {formatTime(start)}<br />–{formatTime(end)}
                        </td>
                        {DAYS.map(day => {
                          const s = timetableSlots[timeKey]?.[day]
                          const isLab = s?.courseType === 'LAB'
                          return (
                            <td key={day}>
                              {s && (
                                <div style={{ background: isLab ? 'rgba(100,180,255,0.15)' : 'rgba(232,57,14,0.12)', border: `1px solid ${isLab ? 'rgba(100,180,255,0.4)' : 'rgba(232,57,14,0.35)'}`, padding: '5px 6px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: 700, color: isLab ? '#0066AA' : '#C0300A' }}>{s.courseCode}</div>
                                  <div style={{ fontSize: '8px', color: '#6B5F4E', marginTop: '1px' }}>{s.sectionName}</div>
                                  <div style={{ fontSize: '8px', color: '#8B7355', marginTop: '1px' }}>{s.faculties}</div>
                                  {isLab && <div style={{ fontSize: '7px', color: '#0066AA', marginTop: '1px', fontWeight: 700 }}>LAB</div>}
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

          {/* Exam schedule */}
          {selected.length > 0 && (
            <>
              <div style={{ borderTop: '2px solid #D4CCC0', marginBottom: '20px' }} />
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: '#E8390E', letterSpacing: '3px', marginBottom: '14px' }}>EXAM SCHEDULE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selected.map(s => (
                  <div key={s.sectionId} style={{ background: '#EDE8DF', border: '1px solid #D4CCC0', padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: '#C0300A', letterSpacing: '1px', marginBottom: '4px' }}>
                      {s.courseCode} — {s.sectionName} · <span style={{ fontSize: '11px', color: '#8B7355', fontFamily: 'IBM Plex Mono,monospace', fontWeight: 400 }}>{s.faculties}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {s.sectionSchedule?.midExamDetail && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', color: '#8B7355', fontFamily: 'IBM Plex Mono,monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Mid:</span>
                          <span style={{ fontSize: '10px', color: '#3A3025', fontFamily: 'IBM Plex Mono,monospace' }}>{s.sectionSchedule.midExamDetail}</span>
                        </div>
                      )}
                      {s.sectionSchedule?.finalExamDetail && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', color: '#C0300A', fontFamily: 'IBM Plex Mono,monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Final:</span>
                          <span style={{ fontSize: '10px', color: '#3A3025', fontFamily: 'IBM Plex Mono,monospace' }}>{s.sectionSchedule.finalExamDetail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PageLayout>
    )
  }

  // ── MOBILE TAB LAYOUT ──
  return (
    <PageLayout
      eyebrow="Routine Builder"
      title="Build your routine.<br/>Avoid conflicts."
      subtitle="Live USIS data. Add sections, see your timetable and exam schedule."
    >
      <style>{`
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .tt-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .tt-table th { background: #E8E0D4; padding: 8px 6px; text-align: center; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: #6B5F4E; border: 1px solid #D4CCC0; font-family: IBM Plex Mono,monospace; }
        .tt-table td { border: 1px solid #D4CCC0; padding: 4px; vertical-align: top; min-width: 60px; height: 48px; background: #F2EDE4; }
      `}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
        {tabBtn('courses', '📋 Courses')}
        {tabBtn('timetable', `🗓️ Timetable${selected.length > 0 ? ` (${selected.length})` : ''}`)}
        {tabBtn('exams', '📝 Exams')}
      </div>

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <>
          {selected.length > 0 && (
            <div style={{ background: 'rgba(0,180,255,0.06)', border: '1px solid rgba(0,180,255,0.2)', padding: '10px 14px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>{selected.length} courses · {totalCredits}cr</div>
              <div style={{ display: 'flex', gap: '5px', flex: 1, flexWrap: 'wrap' }}>
                {selected.map(s => (
                  <span key={s.sectionId} style={{ fontSize: '9px', background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.3)', color: 'var(--paper)', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {s.courseCode}-{s.sectionName}
                    <button onClick={() => removeSection(s)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '10px', cursor: 'crosshair', padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
              <button onClick={() => setSelected([])} style={{ fontSize: '9px', color: 'var(--faded)', background: 'none', border: '1px solid var(--border)', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', flexShrink: 0 }}>Clear</button>
            </div>
          )}

          <input placeholder="Search course, faculty, section..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 14px', outline: 'none', marginBottom: '10px' }} />

          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setAvailableOnly(p => !p)}
              style={{ padding: '6px 12px', background: availableOnly ? 'rgba(95,212,154,0.15)' : 'transparent', color: availableOnly ? '#5fd49a' : 'var(--faded)', border: `1px solid ${availableOnly ? 'rgba(95,212,154,0.4)' : 'var(--border)'}`, fontSize: '9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: availableOnly ? '#5fd49a' : 'var(--faded)', display: 'inline-block' }} />Available Now
            </button>
            <button onClick={() => setHideConflicts(p => !p)}
              style={{ padding: '6px 12px', background: hideConflicts ? 'rgba(0,180,255,0.15)' : 'transparent', color: hideConflicts ? 'var(--red)' : 'var(--faded)', border: `1px solid ${hideConflicts ? 'rgba(0,180,255,0.4)' : 'var(--border)'}`, fontSize: '9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hideConflicts ? 'var(--red)' : 'var(--faded)', display: 'inline-block' }} />Hide Conflicts
            </button>
            <div style={{ fontSize: '10px', color: 'var(--faded)', alignSelf: 'center', marginLeft: 'auto' }}>{filtered.length} sections</div>
          </div>

          <div style={{ border: '1px solid var(--border)', maxHeight: 'calc(100vh - 440px)', minHeight: '400px', overflowY: 'auto' }}>
            {loading && <div style={{ padding: '32px', textAlign: 'center', fontSize: '11px', color: 'var(--faded)' }}>Loading live USIS data...</div>}
            {filtered.map(s => {
              const conflict = conflictsWithSelected(s)
              const sel = isSelected(s)
              const availColor = getAvailColor(s.availableSeats, s.capacity)
              return (
                <div key={s.sectionId} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: sel ? 'rgba(0,180,255,0.06)' : 'var(--ink)', opacity: conflict && !sel ? 0.4 : 1, borderLeft: `3px solid ${sel ? 'var(--red)' : 'transparent'}` }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '15px', color: 'var(--red)', letterSpacing: '1px' }}>{s.courseCode}</span>
                        <span style={{ fontSize: '9px', border: '1px solid var(--border)', padding: '1px 6px', color: 'var(--faded)' }}>{s.sectionName}</span>
                        <span style={{ fontSize: '9px', color: availColor, fontWeight: 700 }}>({s.availableSeats}/{s.capacity})</span>
                        {s.labSchedules && s.labSchedules.length > 0 && <span style={{ fontSize: '8px', color: '#64b4ff', border: '1px solid rgba(100,180,255,0.3)', padding: '1px 5px' }}>LAB</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--faded)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.courseName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--bronze)', fontWeight: 700 }}>👤 {s.faculties}</div>
                      {s.sectionSchedule?.classSchedules && s.sectionSchedule.classSchedules.length > 0 && (
                        <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '3px' }}>
                          {s.sectionSchedule.classSchedules.map(c => `${DAY_SHORT[c.day]} ${formatTime(c.startTime)}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                      <button onClick={() => sel ? removeSection(s) : addSection(s)}
                        style={{ background: sel ? 'rgba(0,180,255,0.15)' : 'var(--red)', color: sel ? 'var(--red)' : 'var(--paper)', border: `1px solid ${sel ? 'rgba(0,180,255,0.4)' : 'var(--red)'}`, padding: '6px 14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                        {sel ? 'Remove' : 'Add'}
                      </button>
                      <button onClick={() => setPreviewModal(s)}
                        style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '4px 14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                        Info
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--faded)' }}>{totalCredits} credits · {selected.length} courses</div>
            {selected.length > 0 && (
              <button onClick={downloadCombined} disabled={downloading}
                style={{ background: downloading ? 'var(--dim)' : 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '8px 18px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: downloading ? 'wait' : 'crosshair' }}>
                {downloading ? '⏳ Saving...' : '⬇ Download Full Routine'}
              </button>
            )}
          </div>

          {selected.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗓️</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '8px' }}>No Courses Selected</div>
              <button onClick={() => setActiveTab('courses')}
                style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '10px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                ← Add Courses
              </button>
            </div>
          ) : (
            <div ref={combinedRef} style={{ background: '#F2EDE4', padding: '16px' }}>
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: '#E8390E', letterSpacing: '3px' }}>BRACU/CMD — CLASS TIMETABLE</div>
                <div style={{ fontSize: '10px', color: '#6B5F4E' }}>{totalCredits} credits · {selected.length} courses</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tt-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Time</th>
                      {DAYS.map(d => <th key={d}>{DAY_SHORT[d]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTimes.map(timeKey => {
                      const [start, end] = timeKey.split('-')
                      return (
                        <tr key={timeKey}>
                          <td style={{ background: '#E8E0D4', padding: '6px 4px', textAlign: 'center', fontSize: '9px', color: '#6B5F4E', fontFamily: 'IBM Plex Mono,monospace', whiteSpace: 'nowrap' }}>
                            {formatTime(start)}<br />–{formatTime(end)}
                          </td>
                          {DAYS.map(day => {
                            const s = timetableSlots[timeKey]?.[day]
                            const isLab = s?.courseType === 'LAB'
                            return (
                              <td key={day}>
                                {s && (
                                  <div style={{ background: isLab ? 'rgba(100,180,255,0.15)' : 'rgba(232,57,14,0.12)', border: `1px solid ${isLab ? 'rgba(100,180,255,0.4)' : 'rgba(232,57,14,0.35)'}`, padding: '4px 5px' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 700, color: isLab ? '#0066AA' : '#C0300A' }}>{s.courseCode}</div>
                                    <div style={{ fontSize: '8px', color: '#6B5F4E', marginTop: '1px' }}>{s.sectionName}</div>
                                    <div style={{ fontSize: '8px', color: '#8B7355', marginTop: '1px' }}>{s.faculties}</div>
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
              <div style={{ borderTop: '2px solid #D4CCC0', margin: '20px 0 14px' }} />
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: '#E8390E', letterSpacing: '3px', marginBottom: '12px' }}>EXAM SCHEDULE</div>
              {selected.map(s => (
                <div key={s.sectionId} style={{ background: '#EDE8DF', border: '1px solid #D4CCC0', padding: '10px 14px', marginBottom: '4px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '13px', color: '#C0300A', marginBottom: '4px' }}>{s.courseCode} — {s.sectionName}</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', fontFamily: 'IBM Plex Mono,monospace' }}>
                    {s.sectionSchedule?.midExamDetail && <span style={{ color: '#8B7355' }}>Mid: <span style={{ color: '#3A3025' }}>{s.sectionSchedule.midExamDetail}</span></span>}
                    {s.sectionSchedule?.finalExamDetail && <span style={{ color: '#C0300A' }}>Final: <span style={{ color: '#3A3025' }}>{s.sectionSchedule.finalExamDetail}</span></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        <div>
          <div style={{ fontSize: '11px', color: 'var(--faded)', marginBottom: '14px' }}>{selected.length} courses · {totalCredits} credits</div>
          {selected.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '8px' }}>No Courses Selected</div>
              <button onClick={() => setActiveTab('courses')}
                style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '10px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                ← Add Courses
              </button>
            </div>
          ) : selected.map(s => (
            <div key={s.sectionId} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px 16px', marginBottom: '2px' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: 'var(--red)', letterSpacing: '1px', marginBottom: '4px' }}>{s.courseCode} - {s.sectionName}</div>
              <div style={{ fontSize: '10px', color: 'var(--bronze)', marginBottom: '10px' }}>{s.faculties} · {s.courseName}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {s.sectionSchedule?.midExamDetail ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,180,255,0.05)', border: '1px solid rgba(0,180,255,0.15)', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--bronze)', fontWeight: 700 }}>📅 MIDTERM</span>
                    <span style={{ fontSize: '10px', color: 'var(--paper)' }}>{s.sectionSchedule.midExamDetail}</span>
                  </div>
                ) : <div style={{ fontSize: '10px', color: 'var(--faded)', padding: '6px 10px' }}>Midterm: Not scheduled</div>}
                {s.sectionSchedule?.finalExamDetail ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.2)', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700 }}>📅 FINAL</span>
                    <span style={{ fontSize: '10px', color: 'var(--paper)' }}>{s.sectionSchedule.finalExamDetail}</span>
                  </div>
                ) : <div style={{ fontSize: '10px', color: 'var(--faded)', padding: '6px 10px' }}>Final: Not scheduled</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MOBILE PREVIEW MODAL */}
      {previewModal && (
        <>
          <div onClick={() => setPreviewModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,26,0.9)', zIndex: 900, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--ink2)', border: '1px solid var(--border)', borderBottom: 'none', zIndex: 901, maxHeight: '85vh', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s ease-out' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--red)', letterSpacing: '2px' }}>{previewModal.courseCode} - {previewModal.sectionName}</div>
                <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '2px' }}>{previewModal.courseName}</div>
              </div>
              <button onClick={() => setPreviewModal(null)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', fontSize: '12px', cursor: 'crosshair', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px', fontWeight: 700 }}>FACULTY</div>
                <div style={{ fontSize: '16px', color: 'var(--bronze)', fontWeight: 700 }}>👤 {previewModal.faculties}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '4px' }}>Section {previewModal.sectionName} · {previewModal.courseCredit}cr</div>
              </div>
              {previewModal.sectionSchedule?.classSchedules && previewModal.sectionSchedule.classSchedules.length > 0 && (
                <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>CLASS SCHEDULE</div>
                  {previewModal.sectionSchedule.classSchedules.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,180,255,0.06)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>{s.day}</span>
                      <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                    </div>
                  ))}
                  {previewModal.roomName && <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '8px' }}>📍 {previewModal.roomName}</div>}
                </div>
              )}
              {previewModal.labSchedules && previewModal.labSchedules.length > 0 && (
                <div style={{ background: 'var(--ink)', border: '1px solid rgba(100,180,255,0.25)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#64b4ff', marginBottom: '8px', fontWeight: 700 }}>🧪 LAB</div>
                  {previewModal.labSchedules.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
                      <span style={{ color: '#64b4ff', fontWeight: 700 }}>{s.day}</span>
                      <span style={{ color: 'var(--paper)' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                    </div>
                  ))}
                  {previewModal.labRoomName && <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '8px' }}>📍 {previewModal.labRoomName}</div>}
                </div>
              )}
              {(previewModal.sectionSchedule?.midExamDetail || previewModal.sectionSchedule?.finalExamDetail) && (
                <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>EXAM DATES</div>
                  {previewModal.sectionSchedule?.midExamDetail && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,180,255,0.06)', fontSize: '11px', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: 'var(--bronze)' }}>Midterm</span>
                      <span style={{ color: 'var(--paper)' }}>{previewModal.sectionSchedule.midExamDetail}</span>
                    </div>
                  )}
                  {previewModal.sectionSchedule?.finalExamDetail && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '11px', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: 'var(--red)' }}>Final</span>
                      <span style={{ color: 'var(--paper)' }}>{previewModal.sectionSchedule.finalExamDetail}</span>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => { isSelected(previewModal) ? removeSection(previewModal) : addSection(previewModal); setPreviewModal(null) }}
                style={{ width: '100%', background: isSelected(previewModal) ? 'rgba(0,180,255,0.1)' : 'var(--red)', color: isSelected(previewModal) ? 'var(--red)' : 'var(--paper)', border: `1px solid ${isSelected(previewModal) ? 'rgba(0,180,255,0.4)' : 'var(--red)'}`, padding: '14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                {isSelected(previewModal) ? 'Remove from Routine' : 'Add to Routine →'}
              </button>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  )
}
