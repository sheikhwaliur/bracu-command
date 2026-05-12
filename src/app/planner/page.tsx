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
  { code: 'CSE220', name: 'Data Structures', credits: 3, type: 'core' as const },
  { code: 'CSE221', name: 'Algorithms', credits: 3, type: 'core' as const },
  { code: 'CSE260', name: 'Database Systems', credits: 3, type: 'core' as const },
  { code: 'CSE341', name: 'Operating Systems', credits: 3, type: 'core' as const },
  { code: 'CSE370', name: 'Software Engineering', credits: 3, type: 'core' as const },
  { code: 'CSE400', name: 'Computer Ethics', credits: 3, type: 'core' as const },
  { code: 'CSE420', name: 'Artificial Intelligence', credits: 3, type: 'elective' as const },
  { code: 'CSE421', name: 'Machine Learning', credits: 3, type: 'elective' as const },
  { code: 'CSE440', name: 'Computer Networks', credits: 3, type: 'elective' as const },
  { code: 'CSE482', name: 'Deep Learning', credits: 3, type: 'elective' as const },
  { code: 'CSE499', name: 'Senior Thesis', credits: 6, type: 'core' as const },
  { code: 'MAT110', name: 'Calculus I', credits: 3, type: 'general' as const },
  { code: 'MAT215', name: 'Linear Algebra', credits: 3, type: 'general' as const },
  { code: 'MAT216', name: 'Calculus II', credits: 3, type: 'general' as const },
  { code: 'ENG101', name: 'English Composition', credits: 3, type: 'general' as const },
  { code: 'PHY111', name: 'Physics I', credits: 3, type: 'general' as const },
  { code: 'SOC101', name: 'Sociology', credits: 3, type: 'general' as const },
]

const SEM_NAMES = ['Spring 2022','Summer 2022','Fall 2022','Spring 2023','Summer 2023','Fall 2023','Spring 2024','Summer 2024','Fall 2024','Spring 2025','Summer 2025','Fall 2025','Spring 2026','Summer 2026','Fall 2026']

const TYPE_COLOR: Record<string, string> = { core: 'var(--red)', elective: 'var(--bronze)', general: 'var(--faded)' }

export default function PlannerPage() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Spring 2022', status: 'completed', courses: [
      { id: 'c1', code: 'CSE110', name: 'Introduction to CS', credits: 3, type: 'core' },
      { id: 'c2', code: 'MAT110', name: 'Calculus I', credits: 3, type: 'general' },
      { id: 'c3', code: 'ENG101', name: 'English Composition', credits: 3, type: 'general' },
    ]},
    { id: '2', name: 'Spring 2024', status: 'current', courses: [
      { id: 'c4', code: 'CSE220', name: 'Data Structures', credits: 3, type: 'core' },
      { id: 'c5', code: 'CSE221', name: 'Algorithms', credits: 3, type: 'core' },
      { id: 'c6', code: 'MAT215', name: 'Linear Algebra', credits: 3, type: 'general' },
    ]},
    { id: '3', name: 'Fall 2024', status: 'planned', courses: [
      { id: 'c7', code: 'CSE341', name: 'Operating Systems', credits: 3, type: 'core' },
      { id: 'c8', code: 'CSE260', name: 'Database Systems', credits: 3, type: 'core' },
    ]},
  ])

  const [showAddSem, setShowAddSem] = useState(false)
  const [newSemName, setNewSemName] = useState(SEM_NAMES[8])
  const [addingCourseTo, setAddingCourseTo] = useState<string|null>(null)
  const [courseSearch, setCourseSearch] = useState('')

  const totalCredits = semesters.flatMap(s=>s.courses).reduce((a,c)=>a+c.credits,0)
  const completedCredits = semesters.filter(s=>s.status==='completed').flatMap(s=>s.courses).reduce((a,c)=>a+c.credits,0)

  const addSemester = () => {
    setSemesters(p=>[...p,{id:Date.now().toString(),name:newSemName,status:'planned',courses:[]}])
    setShowAddSem(false)
  }

  const addCourseToSem = (semId: string, course: typeof COURSE_POOL[0]) => {
    setSemesters(p=>p.map(s=>s.id===semId ? {...s,courses:[...s.courses,{id:Date.now().toString(),...course}]} : s))
    setAddingCourseTo(null)
    setCourseSearch('')
  }

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters(p=>p.map(s=>s.id===semId ? {...s,courses:s.courses.filter(c=>c.id!==courseId)} : s))
  }

  const removeSem = (semId: string) => setSemesters(p=>p.filter(s=>s.id!==semId))

  const toggleStatus = (semId: string) => {
    setSemesters(p=>p.map(s=>{
      if (s.id!==semId) return s
      const next: Semester['status'][] = ['planned','current','completed']
      const idx = next.indexOf(s.status)
      return {...s,status:next[(idx+1)%3]}
    }))
  }

  const statusColor = (s: Semester['status']) => s==='completed' ? '#5fd49a' : s==='current' ? 'var(--red)' : 'var(--faded)'
  const statusLabel = (s: Semester['status']) => s==='completed' ? '✓ Done' : s==='current' ? '● Current' : '○ Planned'

  const filteredCourses = COURSE_POOL.filter(c => !courseSearch || c.code.toLowerCase().includes(courseSearch.toLowerCase()) || c.name.toLowerCase().includes(courseSearch.toLowerCase()))

  return (
    <PageLayout eyebrow="Course Planner" title="Plan your entire<br/>university journey." subtitle="Map all semesters from now until graduation.">

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        {[
          { label: 'Planned Credits', val: totalCredits, color: 'var(--paper)' },
          { label: 'Completed', val: completedCredits, color: '#5fd49a' },
          { label: 'Remaining', val: Math.max(0,136-completedCredits), color: 'var(--red)' },
          { label: 'Semesters', val: semesters.length, color: 'var(--bronze)' },
        ].map((s,i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[['core','Core'],['elective','Elective'],['general','General']].map(([type,label]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--faded)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLOR[type], display: 'inline-block' }} />{label}
          </div>
        ))}
        <div style={{ fontSize: '9px', color: 'var(--dim)', marginLeft: 'auto', alignSelf: 'center' }}>Tap status to toggle</div>
      </div>

      {/* Semesters — single column on mobile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
        {semesters.map(sem => {
          const semCredits = sem.courses.reduce((a,c)=>a+c.credits,0)
          return (
            <div key={sem.id} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '16px' }}>
              {/* Semester header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: 'var(--paper)', letterSpacing: '1px', flex: 1 }}>{sem.name}</div>
                <button onClick={() => toggleStatus(sem.id)}
                  style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: statusColor(sem.status), background: 'none', border: `1px solid ${statusColor(sem.status)}`, padding: '3px 8px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                  {statusLabel(sem.status)}
                </button>
                <span style={{ fontSize: '10px', color: 'var(--red)', letterSpacing: '1px' }}>{semCredits}cr</span>
                <button onClick={() => removeSem(sem.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '14px', cursor: 'crosshair' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                  onMouseLeave={e=>(e.currentTarget.style.color='var(--faded)')}>✕</button>
              </div>

              {/* Courses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                {sem.courses.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(242,237,228,0.03)', border: '1px solid var(--border)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TYPE_COLOR[c.type], display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', color: 'var(--red)', flexShrink: 0, letterSpacing: '.5px' }}>{c.code}</span>
                    <span style={{ fontSize: '10px', color: 'var(--faded)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span style={{ fontSize: '9px', color: 'var(--faded)', flexShrink: 0 }}>{c.credits}cr</span>
                    <button onClick={() => removeCourse(sem.id, c.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '11px', cursor: 'crosshair', flexShrink: 0 }}
                      onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                      onMouseLeave={e=>(e.currentTarget.style.color='var(--faded)')}>✕</button>
                  </div>
                ))}
                {sem.courses.length === 0 && (
                  <div style={{ padding: '10px', textAlign: 'center', color: 'var(--dim)', fontSize: '10px', border: '1px dashed rgba(242,237,228,0.08)' }}>No courses</div>
                )}
              </div>

              {/* Add course */}
              {addingCourseTo === sem.id ? (
                <div>
                  <input autoFocus placeholder="Search..." value={courseSearch} onChange={e=>setCourseSearch(e.target.value)}
                    style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '8px 10px', outline: 'none', marginBottom: '4px' }} />
                  <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border)' }}>
                    {filteredCourses.filter(c=>!sem.courses.find(sc=>sc.code===c.code)).slice(0,8).map(c => (
                      <div key={c.code} onClick={() => addCourseToSem(sem.id, c)}
                        style={{ padding: '8px 10px', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'crosshair', borderBottom: '1px solid var(--border)', background: 'var(--ink)', fontSize: '10px' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='var(--ink2)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='var(--ink)')}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: TYPE_COLOR[c.type], flexShrink: 0 }} />
                        <span style={{ color: 'var(--red)', width: '52px', flexShrink: 0 }}>{c.code}</span>
                        <span style={{ color: 'var(--faded)', flex: 1 }}>{c.name}</span>
                        <span style={{ color: 'var(--faded)' }}>{c.credits}cr</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setAddingCourseTo(null); setCourseSearch('') }}
                    style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--faded)', fontSize: '10px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setAddingCourseTo(sem.id); setCourseSearch('') }}
                  style={{ width: '100%', background: 'none', border: '1px dashed rgba(242,237,228,0.1)', color: 'var(--faded)', padding: '7px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='var(--red)'; (e.currentTarget as HTMLElement).style.color='var(--red)' }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(242,237,228,0.1)'; (e.currentTarget as HTMLElement).style.color='var(--faded)' }}>
                  + Add Course
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Add semester */}
      {showAddSem ? (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '16px' }}>
          <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>Select Semester</label>
          <select value={newSemName} onChange={e=>setNewSemName(e.target.value)}
            style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', marginBottom: '10px' }}>
            {SEM_NAMES.filter(s=>!semesters.find(sem=>sem.name===s)).map(s=><option key={s}>{s}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={addSemester} style={{ flex: 1, background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>Add →</button>
            <button onClick={() => setShowAddSem(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '10px 16px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddSem(true)}
          style={{ width: '100%', background: 'none', border: '1px dashed rgba(242,237,228,0.12)', color: 'var(--faded)', padding: '14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='var(--red)'; (e.currentTarget as HTMLElement).style.color='var(--red)' }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(242,237,228,0.12)'; (e.currentTarget as HTMLElement).style.color='var(--faded)' }}>
          + Add Semester
        </button>
      )}
    </PageLayout>
  )
}