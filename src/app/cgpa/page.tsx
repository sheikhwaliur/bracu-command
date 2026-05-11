'use client'
import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Course {
  id: string
  name: string
  credits: number
  grade: string
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0,
}

const GRADES = Object.keys(GRADE_POINTS)

const BRACU_COURSES = [
  { name: 'CSE110 - Intro to CS', credits: 3 },
  { name: 'CSE111 - Programming I', credits: 3 },
  { name: 'CSE220 - Data Structures', credits: 3 },
  { name: 'CSE221 - Algorithms', credits: 3 },
  { name: 'CSE230 - Discrete Math', credits: 3 },
  { name: 'CSE341 - Operating Systems', credits: 3 },
  { name: 'CSE370 - Software Engineering', credits: 3 },
  { name: 'CSE400 - Computer Ethics', credits: 3 },
  { name: 'CSE423 - Computer Vision', credits: 3 },
  { name: 'CSE470 - Software Engineering Lab', credits: 1 },
  { name: 'CSE471 - Computer Networks', credits: 3 },
  { name: 'CSE482 - Machine Learning', credits: 3 },
  { name: 'MAT215 - Linear Algebra', credits: 3 },
  { name: 'MAT216 - Calculus II', credits: 3 },
  { name: 'ENG101 - English Composition', credits: 3 },
  { name: 'PHY111 - Physics I', credits: 3 },
]

function newCourse(): Course {
  return { id: Date.now().toString(), name: '', credits: 3, grade: 'A' }
}

export default function CGPAPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'CSE220 - Data Structures', credits: 3, grade: 'A' },
    { id: '2', name: 'MAT215 - Linear Algebra', credits: 3, grade: 'B+' },
    { id: '3', name: 'ENG101 - English Composition', credits: 3, grade: 'A-' },
  ])
  const [prevCGPA, setPrevCGPA] = useState('')
  const [prevCredits, setPrevCredits] = useState('')
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null)

  const addCourse = () => setCourses(p => [...p, newCourse()])
  const removeCourse = (id: string) => setCourses(p => p.filter(c => c.id !== id))
  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(p => p.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  // Calculate semester GPA
  const totalCredits = courses.reduce((a, c) => a + c.credits, 0)
  const totalPoints = courses.reduce((a, c) => a + (GRADE_POINTS[c.grade] || 0) * c.credits, 0)
  const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0

  // Calculate cumulative CGPA
  const prevCGPANum = parseFloat(prevCGPA) || 0
  const prevCreditsNum = parseInt(prevCredits) || 0
  const cumulativePoints = (prevCGPANum * prevCreditsNum) + totalPoints
  const cumulativeCredits = prevCreditsNum + totalCredits
  const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : semesterGPA

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return '#5fd49a'
    if (gpa >= 3.0) return 'var(--paper)'
    if (gpa >= 2.0) return 'var(--bronze)'
    return 'var(--red)'
  }

  const getGPALabel = (gpa: number) => {
    if (gpa >= 3.7) return 'Distinction'
    if (gpa >= 3.3) return 'First Class'
    if (gpa >= 3.0) return 'Second Class Upper'
    if (gpa >= 2.5) return 'Second Class Lower'
    if (gpa >= 2.0) return 'Pass'
    return 'Below Pass'
  }

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }

  return (
    <PageLayout
      eyebrow="CGPA Calculator"
      title="Calculate your<br/>CGPA instantly."
      subtitle="Enter your courses, credits, and grades. Get your semester GPA and cumulative CGPA in real time."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>

        {/* Left — Course input */}
        <div>
          {/* Previous CGPA (optional) */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// Previous CGPA (Optional)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Current CGPA</label>
                <input style={inp} type="number" placeholder="e.g. 3.50" min="0" max="4" step="0.01" value={prevCGPA} onChange={e => setPrevCGPA(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Credits Completed</label>
                <input style={inp} type="number" placeholder="e.g. 72" min="0" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '8px', letterSpacing: '.3px' }}>Fill these to calculate your updated cumulative CGPA after this semester.</div>
          </div>

          {/* Course list */}
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px', fontWeight: 700 }}>// This Semester's Courses</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
            {courses.map((c, i) => (
              <div key={c.id} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 80px 100px auto', gap: '10px', alignItems: 'center' }}>
                {/* Course name with autocomplete */}
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inp, fontSize: '12px' }}
                    placeholder="Course name or code..."
                    value={c.name}
                    onChange={e => { updateCourse(c.id, 'name', e.target.value); setShowSuggestions(c.id) }}
                    onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                  />
                  {showSuggestions === c.id && c.name.length > 1 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--ink2)', border: '1px solid var(--border)', zIndex: 100, maxHeight: '160px', overflowY: 'auto' }}>
                      {BRACU_COURSES.filter(bc => bc.name.toLowerCase().includes(c.name.toLowerCase())).map(bc => (
                        <div key={bc.name}
                          onClick={() => { updateCourse(c.id, 'name', bc.name); updateCourse(c.id, 'credits', bc.credits); setShowSuggestions(null) }}
                          style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--faded)', cursor: 'crosshair', borderBottom: '1px solid var(--border)', transition: 'background .1s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(242,237,228,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          {bc.name} ({bc.credits} cr)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Credits */}
                <select
                  value={c.credits}
                  onChange={e => updateCourse(c.id, 'credits', parseInt(e.target.value))}
                  style={{ ...inp, padding: '9px 8px' }}>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} cr</option>)}
                </select>

                {/* Grade */}
                <select
                  value={c.grade}
                  onChange={e => updateCourse(c.id, 'grade', e.target.value)}
                  style={{ ...inp, padding: '9px 8px', color: GRADE_POINTS[c.grade] >= 3.7 ? '#5fd49a' : GRADE_POINTS[c.grade] >= 2.7 ? 'var(--paper)' : GRADE_POINTS[c.grade] >= 2.0 ? 'var(--bronze)' : 'var(--red)' }}>
                  {GRADES.map(g => <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(1)})</option>)}
                </select>

                {/* Remove */}
                <button onClick={() => removeCourse(c.id)}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'crosshair', fontSize: '14px', transition: 'all .15s', flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button onClick={addCourse}
            style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(242,237,228,0.15)', color: 'var(--faded)', padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,237,228,0.15)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
            + Add Course
          </button>

          {/* Grade reference table */}
          <div style={{ marginTop: '24px', background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', fontWeight: 700 }}>BRACU Grade Scale</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px' }}>
              {GRADES.map(g => (
                <div key={g} style={{ background: 'var(--ink)', padding: '8px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: GRADE_POINTS[g] >= 3.7 ? '#5fd49a' : GRADE_POINTS[g] >= 2.7 ? 'var(--paper)' : GRADE_POINTS[g] >= 2.0 ? 'var(--bronze)' : 'var(--red)' }}>{g}</div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '2px' }}>{GRADE_POINTS[g].toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'sticky', top: '80px' }}>

          {/* Semester GPA */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px' }}>Semester GPA</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '64px', lineHeight: 1, letterSpacing: '2px', color: getGPAColor(semesterGPA), transition: 'color .3s' }}>
              {semesterGPA.toFixed(2)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '6px', letterSpacing: '1px' }}>{getGPALabel(semesterGPA)}</div>
          </div>

          {/* Cumulative CGPA */}
          {(prevCGPANum > 0 || prevCreditsNum > 0) && (
            <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px' }}>Updated CGPA</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '48px', lineHeight: 1, letterSpacing: '2px', color: getGPAColor(cgpa) }}>
                {cgpa.toFixed(2)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '4px' }}>{getGPALabel(cgpa)}</div>
            </div>
          )}

          {/* Stats */}
          <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>This Semester</div>
            {[
              { label: 'Courses', val: courses.length },
              { label: 'Total Credits', val: totalCredits },
              { label: 'Grade Points', val: totalPoints.toFixed(1) },
              { label: 'Semester GPA', val: semesterGPA.toFixed(2) },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '11px' }}>
                <span style={{ color: 'var(--faded)' }}>{s.label}</span>
                <span style={{ color: 'var(--paper)', fontWeight: 700 }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* What grade do I need */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px', fontWeight: 700 }}>Target CGPA</div>
            <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
              For Distinction (3.70+):<br />
              <span style={{ color: '#5fd49a', fontWeight: 700 }}>Need {Math.max(0, ((3.70 * cumulativeCredits) - (prevCGPANum * prevCreditsNum)) / totalCredits).toFixed(2)} GPA</span> this sem<br /><br />
              For First Class (3.30+):<br />
              <span style={{ color: 'var(--paper)', fontWeight: 700 }}>Need {Math.max(0, ((3.30 * cumulativeCredits) - (prevCGPANum * prevCreditsNum)) / totalCredits).toFixed(2)} GPA</span> this sem
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}