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

function newCourse(): Course {
  return { id: Date.now().toString(), name: '', credits: 3, grade: 'A' }
}

export default function CGPAPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'CSE220', credits: 3, grade: 'A' },
    { id: '2', name: 'MAT215', credits: 3, grade: 'B+' },
    { id: '3', name: 'ENG101', credits: 3, grade: 'A-' },
  ])
  const [prevCGPA, setPrevCGPA] = useState('')
  const [prevCredits, setPrevCredits] = useState('')

  const addCourse = () => setCourses(p=>[...p, newCourse()])
  const removeCourse = (id: string) => setCourses(p=>p.filter(c=>c.id!==id))
  const update = (id: string, field: keyof Course, value: any) =>
    setCourses(p=>p.map(c=>c.id===id ? {...c,[field]:value} : c))

  const totalCredits = courses.reduce((a,c)=>a+c.credits,0)
  const totalPoints = courses.reduce((a,c)=>a+(GRADE_POINTS[c.grade]||0)*c.credits,0)
  const semGPA = totalCredits > 0 ? totalPoints/totalCredits : 0

  const prevCGPANum = parseFloat(prevCGPA)||0
  const prevCreditsNum = parseInt(prevCredits)||0
  const cumulativePoints = (prevCGPANum*prevCreditsNum)+totalPoints
  const cumulativeCredits = prevCreditsNum+totalCredits
  const cgpa = cumulativeCredits > 0 ? cumulativePoints/cumulativeCredits : semGPA

  const getColor = (gpa: number) => gpa>=3.7 ? '#5fd49a' : gpa>=3.0 ? 'var(--paper)' : gpa>=2.0 ? 'var(--bronze)' : 'var(--red)'
  const getLabel = (gpa: number) => gpa>=3.7 ? 'Distinction' : gpa>=3.3 ? 'First Class' : gpa>=3.0 ? '2nd Class Upper' : gpa>=2.5 ? '2nd Class Lower' : gpa>=2.0 ? 'Pass' : 'Below Pass'

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '8px 10px', outline: 'none', width: '100%' }

  return (
    <PageLayout eyebrow="CGPA Calculator" title="Calculate your<br/>CGPA instantly." subtitle="Enter courses, credits, and grades. Updates in real time.">

      <style>{`
        .cgpa-layout { display: grid; grid-template-columns: 1fr 240px; gap: 20px; align-items: start; }
        @media(max-width:640px) { .cgpa-layout { grid-template-columns: 1fr !important; } }
        .course-row { display: grid; grid-template-columns: 1fr 70px 100px auto; gap: 8px; align-items: center; }
        @media(max-width:480px) { .course-row { grid-template-columns: 1fr 60px 85px auto !important; gap: 6px !important; } }
      `}</style>

      {/* Previous CGPA */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px', fontWeight: 700 }}>// Previous CGPA (Optional)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Current CGPA</label>
            <input style={inp} type="number" placeholder="3.50" min="0" max="4" step="0.01" value={prevCGPA} onChange={e=>setPrevCGPA(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Credits Done</label>
            <input style={inp} type="number" placeholder="72" min="0" value={prevCredits} onChange={e=>setPrevCredits(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="cgpa-layout">
        {/* Left — courses */}
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '10px', fontWeight: 700 }}>// This Semester</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
            {courses.map(c => (
              <div key={c.id} className="course-row" style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '10px 12px' }}>
                <input style={{ ...inp, fontSize: '11px' }} placeholder="Course code..." value={c.name} onChange={e=>update(c.id,'name',e.target.value)} />
                <select value={c.credits} onChange={e=>update(c.id,'credits',parseInt(e.target.value))} style={{ ...inp, padding: '8px 4px', textAlign: 'center' }}>
                  {[1,2,3,4].map(n=><option key={n} value={n}>{n}cr</option>)}
                </select>
                <select value={c.grade} onChange={e=>update(c.id,'grade',e.target.value)}
                  style={{ ...inp, padding: '8px 4px', color: GRADE_POINTS[c.grade]>=3.7 ? '#5fd49a' : GRADE_POINTS[c.grade]>=2.7 ? 'var(--paper)' : 'var(--bronze)' }}>
                  {GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                </select>
                <button onClick={()=>removeCourse(c.id)}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', width: '30px', height: '30px', cursor: 'crosshair', fontSize: '12px', flexShrink: 0 }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='var(--red)';(e.currentTarget as HTMLElement).style.borderColor='var(--red)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='var(--faded)';(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}}>✕</button>
              </div>
            ))}
          </div>

          <button onClick={addCourse}
            style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(242,237,228,0.15)', color: 'var(--faded)', padding: '10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', marginBottom: '16px' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--red)';(e.currentTarget as HTMLElement).style.color='var(--red)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(242,237,228,0.15)';(e.currentTarget as HTMLElement).style.color='var(--faded)'}}>
            + Add Course
          </button>

          {/* Grade scale */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>BRACU Grade Scale</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '2px' }}>
              {GRADES.map(g=>(
                <div key={g} style={{ background: 'var(--ink)', padding: '6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: GRADE_POINTS[g]>=3.7?'#5fd49a':GRADE_POINTS[g]>=2.7?'var(--paper)':GRADE_POINTS[g]>=2.0?'var(--bronze)':'var(--red)' }}>{g}</div>
                  <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '1px' }}>{GRADE_POINTS[g].toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Semester GPA */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '6px' }}>Semester GPA</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '56px', lineHeight: 1, letterSpacing: '2px', color: getColor(semGPA) }}>{semGPA.toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '4px' }}>{getLabel(semGPA)}</div>
          </div>

          {/* Cumulative */}
          {(prevCGPANum>0||prevCreditsNum>0) && (
            <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '4px' }}>Updated CGPA</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '40px', lineHeight: 1, color: getColor(cgpa) }}>{cgpa.toFixed(2)}</div>
              <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '3px' }}>{getLabel(cgpa)}</div>
            </div>
          )}

          {/* Stats */}
          <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '16px' }}>
            {[
              { label: 'Courses', val: courses.length },
              { label: 'Credits', val: totalCredits },
              { label: 'Grade Points', val: totalPoints.toFixed(1) },
            ].map((s,i)=>(
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '11px' }}>
                <span style={{ color: 'var(--faded)' }}>{s.label}</span>
                <span style={{ color: 'var(--paper)', fontWeight: 700 }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Target */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '8px', fontWeight: 700 }}>TARGET GPA</div>
            {prevCreditsNum > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
                For Distinction (3.70+):<br />
                <span style={{ color: '#5fd49a', fontWeight: 700 }}>Need {Math.max(0,((3.70*cumulativeCredits)-(prevCGPANum*prevCreditsNum))/totalCredits).toFixed(2)} GPA</span>
                <br />For First Class (3.30+):<br />
                <span style={{ color: 'var(--paper)', fontWeight: 700 }}>Need {Math.max(0,((3.30*cumulativeCredits)-(prevCGPANum*prevCreditsNum))/totalCredits).toFixed(2)} GPA</span>
              </div>
            )}
            {!prevCreditsNum && <div style={{ fontSize: '10px', color: 'var(--dim)' }}>Enter previous CGPA to see targets</div>}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}