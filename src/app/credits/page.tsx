'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface CompletedCourse {
  id: string
  code: string
  name: string
  credits: number
  grade: string
  semester: string
}

const DEPT_REQUIREMENTS: Record<string, number> = {
  'CSE': 136,
  'EEE': 136,
  'BBA': 130,
  'ECO': 124,
  'LAW': 130,
  'BIO': 130,
  'PHR': 136,
  'ARC': 180,
}

const BRACU_CSE_COURSES = [
  { code: 'CSE110', name: 'Introduction to CS', credits: 3 },
  { code: 'CSE111', name: 'Programming Language I', credits: 3 },
  { code: 'CSE130', name: 'Programming Language II', credits: 3 },
  { code: 'CSE220', name: 'Data Structures', credits: 3 },
  { code: 'CSE221', name: 'Algorithms', credits: 3 },
  { code: 'CSE225', name: 'Digital Logic Design', credits: 3 },
  { code: 'CSE230', name: 'Discrete Mathematics', credits: 3 },
  { code: 'CSE250', name: 'Computer Architecture', credits: 3 },
  { code: 'CSE260', name: 'Database Systems', credits: 3 },
  { code: 'CSE320', name: 'Microprocessors', credits: 3 },
  { code: 'CSE330', name: 'Computer Organization', credits: 3 },
  { code: 'CSE340', name: 'Automata Theory', credits: 3 },
  { code: 'CSE341', name: 'Operating Systems', credits: 3 },
  { code: 'CSE350', name: 'Computer Graphics', credits: 3 },
  { code: 'CSE360', name: 'Data Communications', credits: 3 },
  { code: 'CSE370', name: 'Software Engineering', credits: 3 },
  { code: 'CSE400', name: 'Computer Ethics', credits: 3 },
  { code: 'CSE420', name: 'Artificial Intelligence', credits: 3 },
  { code: 'CSE421', name: 'Machine Learning', credits: 3 },
  { code: 'CSE423', name: 'Computer Vision', credits: 3 },
  { code: 'CSE431', name: 'Compiler Construction', credits: 3 },
  { code: 'CSE440', name: 'Computer Networks', credits: 3 },
  { code: 'CSE445', name: 'Network Security', credits: 3 },
  { code: 'CSE460', name: 'Simulation & Modeling', credits: 3 },
  { code: 'CSE470', name: 'Software Engineering Lab', credits: 1 },
  { code: 'CSE471', name: 'Computer Networks Lab', credits: 1 },
  { code: 'CSE482', name: 'Deep Learning', credits: 3 },
  { code: 'CSE499', name: 'Senior Thesis', credits: 6 },
  { code: 'MAT110', name: 'Calculus I', credits: 3 },
  { code: 'MAT215', name: 'Linear Algebra', credits: 3 },
  { code: 'MAT216', name: 'Calculus II', credits: 3 },
  { code: 'MAT311', name: 'Probability & Statistics', credits: 3 },
  { code: 'ENG101', name: 'English Composition', credits: 3 },
  { code: 'ENG102', name: 'English Communication', credits: 3 },
  { code: 'PHY111', name: 'Physics I', credits: 3 },
  { code: 'PHY112', name: 'Physics II', credits: 3 },
  { code: 'SOC101', name: 'Introduction to Sociology', credits: 3 },
]

const SEMESTERS = ['Spring 2022', 'Summer 2022', 'Fall 2022', 'Spring 2023', 'Summer 2023', 'Fall 2023', 'Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025', 'Summer 2025', 'Fall 2025', 'Spring 2026']

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']

export default function CreditsPage() {
  const [dept, setDept] = useState('CSE')
  const [completed, setCompleted] = useState<CompletedCourse[]>([
    { id: '1', code: 'CSE110', name: 'Introduction to CS', credits: 3, grade: 'A', semester: 'Spring 2022' },
    { id: '2', code: 'CSE111', name: 'Programming Language I', credits: 3, grade: 'A-', semester: 'Spring 2022' },
    { id: '3', code: 'MAT110', name: 'Calculus I', credits: 3, grade: 'B+', semester: 'Spring 2022' },
    { id: '4', code: 'ENG101', name: 'English Composition', credits: 3, grade: 'A', semester: 'Summer 2022' },
    { id: '5', code: 'CSE220', name: 'Data Structures', credits: 3, grade: 'A-', semester: 'Fall 2022' },
    { id: '6', code: 'CSE221', name: 'Algorithms', credits: 3, grade: 'B+', semester: 'Fall 2022' },
    { id: '7', code: 'MAT215', name: 'Linear Algebra', credits: 3, grade: 'B', semester: 'Spring 2023' },
    { id: '8', code: 'CSE341', name: 'Operating Systems', credits: 3, grade: 'A-', semester: 'Fall 2023' },
  ])
  const [form, setForm] = useState({ code: '', name: '', credits: 3, grade: 'A', semester: SEMESTERS[SEMESTERS.length - 1] })
  const [showAdd, setShowAdd] = useState(false)
  const [codeSuggestions, setCodeSuggestions] = useState<typeof BRACU_CSE_COURSES>([])
  const [activeView, setActiveView] = useState<'progress' | 'history'>('progress')

  const totalRequired = DEPT_REQUIREMENTS[dept] || 136
  const creditsDone = completed.reduce((a, c) => a + c.credits, 0)
  const creditsLeft = Math.max(0, totalRequired - creditsDone)
  const progressPct = Math.min(100, (creditsDone / totalRequired) * 100)

  // Estimate semesters remaining (avg 15 credits/semester)
  const semsLeft = Math.ceil(creditsLeft / 15)

  const addCourse = () => {
    if (!form.code || !form.name) return
    setCompleted(p => [...p, { ...form, id: Date.now().toString(), credits: Number(form.credits) }])
    setForm({ code: '', name: '', credits: 3, grade: 'A', semester: SEMESTERS[SEMESTERS.length - 1] })
    setShowAdd(false)
  }

  const removeCourse = (id: string) => setCompleted(p => p.filter(c => c.id !== id))

  const handleCodeChange = (val: string) => {
    setForm(p => ({ ...p, code: val }))
    if (val.length > 1) {
      const sugg = BRACU_CSE_COURSES.filter(c => c.code.toLowerCase().includes(val.toLowerCase()) || c.name.toLowerCase().includes(val.toLowerCase()))
      setCodeSuggestions(sugg.slice(0, 6))
    } else {
      setCodeSuggestions([])
    }
  }

  const selectSuggestion = (c: typeof BRACU_CSE_COURSES[0]) => {
    setForm(p => ({ ...p, code: c.code, name: c.name, credits: c.credits }))
    setCodeSuggestions([])
  }

  // Group by semester
  const bySemester = SEMESTERS.map(sem => ({
    sem,
    courses: completed.filter(c => c.semester === sem),
    credits: completed.filter(c => c.semester === sem).reduce((a, c) => a + c.credits, 0),
  })).filter(s => s.courses.length > 0)

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }

  return (
    <PageLayout
      eyebrow="Credit Tracker"
      title="Track your credits.<br/>Know when you graduate."
      subtitle="Add your completed courses and track your progress toward graduation. See exactly how many semesters you have left."
    >
      {/* Department selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>Department:</span>
        {Object.keys(DEPT_REQUIREMENTS).map(d => (
          <button key={d} onClick={() => setDept(d)}
            style={{ background: dept === d ? 'var(--red)' : 'transparent', color: dept === d ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${dept === d ? 'var(--red)' : 'var(--border)'}`, padding: '6px 14px', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          {/* View tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
            {(['progress', 'history'] as const).map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                style={{ flex: 1, padding: '10px', background: activeView === v ? 'var(--red)' : 'var(--ink2)', color: activeView === v ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                {v === 'progress' ? '📊 Progress' : '📋 Course History'}
              </button>
            ))}
          </div>

          {activeView === 'progress' && (
            <>
              {/* Big progress bar */}
              <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px 24px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '48px', color: '#5fd49a', letterSpacing: '2px', lineHeight: 1 }}>{creditsDone}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>credits completed</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '48px', color: 'var(--red)', letterSpacing: '2px', lineHeight: 1 }}>{creditsLeft}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>credits remaining</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'rgba(242,237,228,0.06)', height: '8px', marginBottom: '8px', position: 'relative' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #5fd49a, var(--red))', width: `${progressPct}%`, transition: 'width .5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>
                  <span>0</span>
                  <span style={{ color: 'var(--paper)', fontWeight: 700 }}>{progressPct.toFixed(1)}% complete</span>
                  <span>{totalRequired} credits ({dept})</span>
                </div>
              </div>

              {/* Milestones */}
              <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: '2px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '16px', fontWeight: 700 }}>MILESTONES</div>
                {[
                  { label: 'Freshman Complete', credits: 30 },
                  { label: 'Sophomore Complete', credits: 60 },
                  { label: 'Junior Complete', credits: 90 },
                  { label: 'Senior Status', credits: 110 },
                  { label: 'Graduation', credits: totalRequired },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: creditsDone >= m.credits ? '#5fd49a' : 'var(--dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>
                      {creditsDone >= m.credits ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1, fontSize: '11px', color: creditsDone >= m.credits ? 'var(--paper)' : 'var(--faded)' }}>{m.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '1px' }}>{m.credits} cr</div>
                    {creditsDone < m.credits && (
                      <div style={{ fontSize: '9px', color: 'var(--red)', letterSpacing: '1px' }}>{m.credits - creditsDone} left</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeView === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {bySemester.map(s => (
                <div key={s.sem} style={{ background: 'var(--ink)', border: '1px solid var(--border)' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ink2)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', letterSpacing: '.5px' }}>{s.sem}</div>
                    <div style={{ fontSize: '10px', color: 'var(--red)', letterSpacing: '1px' }}>{s.credits} credits</div>
                  </div>
                  {s.courses.map(c => (
                    <div key={c.id} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(242,237,228,0.04)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--red)', width: '60px', letterSpacing: '1px', flexShrink: 0 }}>{c.code}</div>
                      <div style={{ flex: 1, fontSize: '11px', color: 'var(--faded)' }}>{c.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--faded)', width: '30px', textAlign: 'center' }}>{c.credits}cr</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, width: '32px', textAlign: 'center', color: c.grade.startsWith('A') ? '#5fd49a' : c.grade.startsWith('B') ? 'var(--paper)' : c.grade === 'F' ? 'var(--red)' : 'var(--bronze)' }}>{c.grade}</div>
                      <button onClick={() => removeCourse(c.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '12px', cursor: 'crosshair', flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--faded)')}>✕</button>
                    </div>
                  ))}
                </div>
              ))}
              {completed.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>No courses added yet.</div>
              )}
            </div>
          )}

          {/* Add course */}
          <button onClick={() => setShowAdd(p => !p)}
            style={{ width: '100%', marginTop: '12px', background: 'transparent', border: '1px dashed rgba(242,237,228,0.15)', color: 'var(--faded)', padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,237,228,0.15)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
            + Add Completed Course
          </button>

          {showAdd && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px', marginTop: '8px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Add Course</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Course Code</label>
                  <input style={inp} placeholder="CSE220" value={form.code} onChange={e => handleCodeChange(e.target.value)} onBlur={() => setTimeout(() => setCodeSuggestions([]), 200)} />
                  {codeSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--ink2)', border: '1px solid var(--border)', zIndex: 100 }}>
                      {codeSuggestions.map(c => (
                        <div key={c.code} onClick={() => selectSuggestion(c)}
                          style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--faded)', cursor: 'crosshair', borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(242,237,228,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span style={{ color: 'var(--red)' }}>{c.code}</span> — {c.name} ({c.credits}cr)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Course Name</label>
                  <input style={inp} placeholder="Data Structures" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Credits</label>
                  <select style={inp} value={form.credits} onChange={e => setForm(p => ({ ...p, credits: parseInt(e.target.value) }))}>
                    {[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Grade</label>
                  <select style={inp} value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }}>Semester</label>
                  <select style={inp} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                    {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={addCourse}
                style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '11px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Add Course →
              </button>
            </div>
          )}
        </div>

        {/* Right — Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'sticky', top: '80px' }}>
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '16px', fontWeight: 700 }}>GRADUATION FORECAST</div>
            {[
              { label: 'Credits Done', val: creditsDone, color: '#5fd49a' },
              { label: 'Credits Left', val: creditsLeft, color: 'var(--red)' },
              { label: 'Required', val: totalRequired, color: 'var(--paper)' },
              { label: 'Courses Done', val: completed.length, color: 'var(--paper)' },
              { label: 'Semesters Left*', val: `~${semsLeft}`, color: 'var(--bronze)' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--faded)' }}>{s.label}</span>
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: s.color, letterSpacing: '1px' }}>{s.val}</span>
              </div>
            ))}
            <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '10px', letterSpacing: '.5px' }}>*Based on 15 credits/semester average</div>
          </div>

          {/* Semester breakdown */}
          <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>BY SEMESTER</div>
            {bySemester.map(s => (
              <div key={s.sem} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '10px' }}>
                <span style={{ color: 'var(--faded)' }}>{s.sem}</span>
                <span style={{ color: 'var(--paper)' }}>{s.credits} cr ({s.courses.length} courses)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}