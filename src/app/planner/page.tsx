'use client'
import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface PlannedCourse {
  id: string
  code: string
  name: string
  credits: number
  type: 'core' | 'elective' | 'general'
}

interface Semester {
  id: string
  name: string
  status: 'completed' | 'current' | 'planned'
  courses: PlannedCourse[]
}

const COURSE_POOL = [
  { code: 'CSE110', name: 'Introduction to CS', credits: 3, type: 'core' as const },
  { code: 'CSE111', name: 'Programming Language I', credits: 3, type: 'core' as const },
  { code: 'CSE130', name: 'Programming Language II', credits: 3, type: 'core' as const },
  { code: 'CSE220', name: 'Data Structures', credits: 3, type: 'core' as const },
  { code: 'CSE221', name: 'Algorithms', credits: 3, type: 'core' as const },
  { code: 'CSE225', name: 'Digital Logic Design', credits: 3, type: 'core' as const },
  { code: 'CSE230', name: 'Discrete Mathematics', credits: 3, type: 'core' as const },
  { code: 'CSE250', name: 'Computer Architecture', credits: 3, type: 'core' as const },
  { code: 'CSE260', name: 'Database Systems', credits: 3, type: 'core' as const },
  { code: 'CSE320', name: 'Microprocessors', credits: 3, type: 'core' as const },
  { code: 'CSE341', name: 'Operating Systems', credits: 3, type: 'core' as const },
  { code: 'CSE370', name: 'Software Engineering', credits: 3, type: 'core' as const },
  { code: 'CSE400', name: 'Computer Ethics', credits: 3, type: 'core' as const },
  { code: 'CSE420', name: 'Artificial Intelligence', credits: 3, type: 'elective' as const },
  { code: 'CSE421', name: 'Machine Learning', credits: 3, type: 'elective' as const },
  { code: 'CSE423', name: 'Computer Vision', credits: 3, type: 'elective' as const },
  { code: 'CSE440', name: 'Computer Networks', credits: 3, type: 'elective' as const },
  { code: 'CSE445', name: 'Network Security', credits: 3, type: 'elective' as const },
  { code: 'CSE482', name: 'Deep Learning', credits: 3, type: 'elective' as const },
  { code: 'CSE499', name: 'Senior Thesis', credits: 6, type: 'core' as const },
  { code: 'MAT110', name: 'Calculus I', credits: 3, type: 'general' as const },
  { code: 'MAT215', name: 'Linear Algebra', credits: 3, type: 'general' as const },
  { code: 'MAT216', name: 'Calculus II', credits: 3, type: 'general' as const },
  { code: 'MAT311', name: 'Probability & Statistics', credits: 3, type: 'general' as const },
  { code: 'ENG101', name: 'English Composition', credits: 3, type: 'general' as const },
  { code: 'ENG102', name: 'English Communication', credits: 3, type: 'general' as const },
  { code: 'PHY111', name: 'Physics I', credits: 3, type: 'general' as const },
  { code: 'PHY112', name: 'Physics II', credits: 3, type: 'general' as const },
  { code: 'SOC101', name: 'Sociology', credits: 3, type: 'general' as const },
]

const SEM_NAMES = ['Spring 2022', 'Summer 2022', 'Fall 2022', 'Spring 2023', 'Summer 2023', 'Fall 2023', 'Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025', 'Summer 2025', 'Fall 2025', 'Spring 2026', 'Summer 2026', 'Fall 2026']

const TYPE_COLOR: Record<string, string> = {
  core: 'var(--red)',
  elective: 'var(--bronze)',
  general: 'var(--faded)',
}

export default function PlannerPage() {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: '1', name: 'Spring 2022', status: 'completed',
      courses: [
        { id: 'c1', code: 'CSE110', name: 'Introduction to CS', credits: 3, type: 'core' },
        { id: 'c2', code: 'MAT110', name: 'Calculus I', credits: 3, type: 'general' },
        { id: 'c3', code: 'ENG101', name: 'English Composition', credits: 3, type: 'general' },
        { id: 'c4', code: 'PHY111', name: 'Physics I', credits: 3, type: 'general' },
      ]
    },
    {
      id: '2', name: 'Fall 2022', status: 'completed',
      courses: [
        { id: 'c5', code: 'CSE111', name: 'Programming Language I', credits: 3, type: 'core' },
        { id: 'c6', code: 'CSE225', name: 'Digital Logic Design', credits: 3, type: 'core' },
        { id: 'c7', code: 'MAT215', name: 'Linear Algebra', credits: 3, type: 'general' },
        { id: 'c8', code: 'SOC101', name: 'Sociology', credits: 3, type: 'general' },
      ]
    },
    {
      id: '3', name: 'Spring 2024', status: 'current',
      courses: [
        { id: 'c9', code: 'CSE220', name: 'Data Structures', credits: 3, type: 'core' },
        { id: 'c10', code: 'CSE230', name: 'Discrete Mathematics', credits: 3, type: 'core' },
        { id: 'c11', code: 'MAT216', name: 'Calculus II', credits: 3, type: 'general' },
      ]
    },
    {
      id: '4', name: 'Fall 2024', status: 'planned',
      courses: [
        { id: 'c12', code: 'CSE221', name: 'Algorithms', credits: 3, type: 'core' },
        { id: 'c13', code: 'CSE260', name: 'Database Systems', credits: 3, type: 'core' },
        { id: 'c14', code: 'CSE341', name: 'Operating Systems', credits: 3, type: 'core' },
      ]
    },
  ])

  const [showAddSem, setShowAddSem] = useState(false)
  const [newSemName, setNewSemName] = useState(SEM_NAMES[8])
  const [addingCourseTo, setAddingCourseTo] = useState<string | null>(null)
  const [courseSearch, setCourseSearch] = useState('')
  const [dragOver, setDragOver] = useState<string | null>(null)

  const totalCredits = semesters.flatMap(s => s.courses).reduce((a, c) => a + c.credits, 0)
  const completedCredits = semesters.filter(s => s.status === 'completed').flatMap(s => s.courses).reduce((a, c) => a + c.credits, 0)

  const addSemester = () => {
    setSemesters(p => [...p, { id: Date.now().toString(), name: newSemName, status: 'planned', courses: [] }])
    setShowAddSem(false)
  }

  const removeSemester = (id: string) => setSemesters(p => p.filter(s => s.id !== id))

  const addCourseToSem = (semId: string, course: typeof COURSE_POOL[0]) => {
    setSemesters(p => p.map(s => s.id === semId ? {
      ...s,
      courses: [...s.courses, { id: Date.now().toString(), ...course }]
    } : s))
    setAddingCourseTo(null)
    setCourseSearch('')
  }

  const removeCourseFromSem = (semId: string, courseId: string) => {
    setSemesters(p => p.map(s => s.id === semId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s))
  }

  const toggleStatus = (semId: string) => {
    setSemesters(p => p.map(s => {
      if (s.id !== semId) return s
      const next: Semester['status'][] = ['planned', 'current', 'completed']
      const idx = next.indexOf(s.status)
      return { ...s, status: next[(idx + 1) % 3] }
    }))
  }

  const filteredCourses = COURSE_POOL.filter(c =>
    !courseSearch || c.code.toLowerCase().includes(courseSearch.toLowerCase()) || c.name.toLowerCase().includes(courseSearch.toLowerCase())
  )

  const statusColor = (s: Semester['status']) => s === 'completed' ? '#5fd49a' : s === 'current' ? 'var(--red)' : 'var(--faded)'
  const statusLabel = (s: Semester['status']) => s === 'completed' ? '✓ Completed' : s === 'current' ? '● Current' : '○ Planned'

  return (
    <PageLayout
      eyebrow="Course Planner"
      title="Plan your entire<br/>university journey."
      subtitle="Map all semesters from now until graduation. Drag, add, and organize your courses visually."
    >
      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '24px' }}>
        {[
          { label: 'Total Planned Credits', val: totalCredits, color: 'var(--paper)' },
          { label: 'Completed Credits', val: completedCredits, color: '#5fd49a' },
          { label: 'Remaining Credits', val: Math.max(0, 136 - completedCredits), color: 'var(--red)' },
          { label: 'Semesters Planned', val: semesters.length, color: 'var(--bronze)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '36px', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[['core', 'Core Course'], ['elective', 'Elective'], ['general', 'General Ed']].map(([type, label]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--faded)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: TYPE_COLOR[type], display: 'inline-block' }} />
            {label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--faded)', marginLeft: 'auto' }}>
          Click status badge to toggle: Planned → Current → Completed
        </div>
      </div>

      {/* Semester grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', background: 'var(--border)' }}>
        {semesters.map(sem => {
          const semCredits = sem.courses.reduce((a, c) => a + c.credits, 0)
          return (
            <div key={sem.id}
              style={{ background: dragOver === sem.id ? 'var(--ink2)' : 'var(--ink)', padding: '20px', position: 'relative', transition: 'background .15s' }}
              onDragOver={e => { e.preventDefault(); setDragOver(sem.id) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => setDragOver(null)}>

              {/* Semester header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--paper)', letterSpacing: '1px', flex: 1 }}>{sem.name}</div>
                <button onClick={() => toggleStatus(sem.id)}
                  style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: statusColor(sem.status), background: 'none', border: `1px solid ${statusColor(sem.status)}`, padding: '3px 9px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', opacity: 0.8, transition: 'all .15s', flexShrink: 0 }}>
                  {statusLabel(sem.status)}
                </button>
                <div style={{ fontSize: '10px', color: 'var(--red)', letterSpacing: '1px', flexShrink: 0 }}>{semCredits}cr</div>
                <button onClick={() => removeSemester(sem.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '14px', cursor: 'crosshair', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--faded)')}>✕</button>
              </div>

              {/* Courses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                {sem.courses.map(c => (
                  <div key={c.id} draggable
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: 'rgba(242,237,228,0.03)', border: '1px solid var(--border)', cursor: 'grab' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLOR[c.type], display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', color: 'var(--red)', width: '56px', flexShrink: 0, letterSpacing: '.5px' }}>{c.code}</span>
                    <span style={{ fontSize: '10px', color: 'var(--faded)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                    <span style={{ fontSize: '9px', color: 'var(--faded)', flexShrink: 0 }}>{c.credits}cr</span>
                    <button onClick={() => removeCourseFromSem(sem.id, c.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '11px', cursor: 'crosshair', flexShrink: 0, lineHeight: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--faded)')}>✕</button>
                  </div>
                ))}
                {sem.courses.length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--dim)', fontSize: '10px', border: '1px dashed rgba(242,237,228,0.08)', letterSpacing: '1px' }}>
                    No courses added
                  </div>
                )}
              </div>

              {/* Add course to this sem */}
              {addingCourseTo === sem.id ? (
                <div>
                  <input
                    autoFocus
                    placeholder="Search course..."
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '7px 10px', outline: 'none', marginBottom: '4px' }}
                  />
                  <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border)' }}>
                    {filteredCourses.filter(c => !sem.courses.find(sc => sc.code === c.code)).slice(0, 8).map(c => (
                      <div key={c.code} onClick={() => addCourseToSem(sem.id, c)}
                        style={{ padding: '7px 10px', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'crosshair', borderBottom: '1px solid var(--border)', background: 'var(--ink)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: TYPE_COLOR[c.type], flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: 'var(--red)', width: '52px', flexShrink: 0 }}>{c.code}</span>
                        <span style={{ fontSize: '10px', color: 'var(--faded)', flex: 1 }}>{c.name}</span>
                        <span style={{ fontSize: '9px', color: 'var(--faded)' }}>{c.credits}cr</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setAddingCourseTo(null); setCourseSearch('') }}
                    style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--faded)', fontSize: '10px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace', letterSpacing: '1px' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => { setAddingCourseTo(sem.id); setCourseSearch('') }}
                  style={{ width: '100%', background: 'none', border: '1px dashed rgba(242,237,228,0.1)', color: 'var(--faded)', padding: '7px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,237,228,0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                  + Add Course
                </button>
              )}
            </div>
          )
        })}

        {/* Add semester tile */}
        <div style={{ background: 'var(--ink)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
          {showAddSem ? (
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px' }}>Select Semester</div>
              <select
                value={newSemName}
                onChange={e => setNewSemName(e.target.value)}
                style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', marginBottom: '10px' }}>
                {SEM_NAMES.filter(s => !semesters.find(sem => sem.name === s)).map(s => <option key={s}>{s}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addSemester}
                  style={{ flex: 1, background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                  Add →
                </button>
                <button onClick={() => setShowAddSem(false)}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '10px 16px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddSem(true)}
              style={{ background: 'none', border: '1px dashed rgba(242,237,228,0.12)', color: 'var(--faded)', padding: '16px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,237,228,0.12)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
              + Add Semester
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  )
}