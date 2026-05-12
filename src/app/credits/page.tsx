'use client'
import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface CompletedCourse {
  id: string
  code: string
  name: string
  credits: number
  grade: string
  semester: string
}

const DEPT_REQUIREMENTS: Record<string, number> = { CSE: 136, EEE: 136, BBA: 130, ECO: 124, LAW: 130, BIO: 130, PHR: 136, ARC: 180 }
const SEMESTERS = ['Spring 2022','Summer 2022','Fall 2022','Spring 2023','Summer 2023','Fall 2023','Spring 2024','Summer 2024','Fall 2024','Spring 2025','Summer 2025','Fall 2025','Spring 2026']
const GRADES = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','F']
const BRACU_COURSES = [
  { code: 'CSE110', name: 'Introduction to CS', credits: 3 },
  { code: 'CSE111', name: 'Programming Language I', credits: 3 },
  { code: 'CSE220', name: 'Data Structures', credits: 3 },
  { code: 'CSE221', name: 'Algorithms', credits: 3 },
  { code: 'CSE260', name: 'Database Systems', credits: 3 },
  { code: 'CSE341', name: 'Operating Systems', credits: 3 },
  { code: 'CSE370', name: 'Software Engineering', credits: 3 },
  { code: 'CSE400', name: 'Computer Ethics', credits: 3 },
  { code: 'CSE471', name: 'Computer Networks', credits: 3 },
  { code: 'CSE482', name: 'Machine Learning', credits: 3 },
  { code: 'CSE499', name: 'Senior Thesis', credits: 6 },
  { code: 'MAT110', name: 'Calculus I', credits: 3 },
  { code: 'MAT215', name: 'Linear Algebra', credits: 3 },
  { code: 'MAT216', name: 'Calculus II', credits: 3 },
  { code: 'ENG101', name: 'English Composition', credits: 3 },
  { code: 'PHY111', name: 'Physics I', credits: 3 },
  { code: 'SOC101', name: 'Sociology', credits: 3 },
]

export default function CreditsPage() {
  const [dept, setDept] = useState('CSE')
  const [completed, setCompleted] = useState<CompletedCourse[]>([
    { id: '1', code: 'CSE110', name: 'Introduction to CS', credits: 3, grade: 'A', semester: 'Spring 2022' },
    { id: '2', code: 'MAT110', name: 'Calculus I', credits: 3, grade: 'B+', semester: 'Spring 2022' },
    { id: '3', code: 'ENG101', name: 'English Composition', credits: 3, grade: 'A', semester: 'Summer 2022' },
    { id: '4', code: 'CSE220', name: 'Data Structures', credits: 3, grade: 'A-', semester: 'Fall 2022' },
    { id: '5', code: 'CSE221', name: 'Algorithms', credits: 3, grade: 'B+', semester: 'Fall 2022' },
    { id: '6', code: 'MAT215', name: 'Linear Algebra', credits: 3, grade: 'B', semester: 'Spring 2023' },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [suggestions, setSuggestions] = useState<typeof BRACU_COURSES>([])
  const [form, setForm] = useState({ code: '', name: '', credits: 3, grade: 'A', semester: SEMESTERS[SEMESTERS.length-1] })
  const [activeView, setActiveView] = useState<'progress'|'history'>('progress')

  const totalRequired = DEPT_REQUIREMENTS[dept]||136
  const creditsDone = completed.reduce((a,c)=>a+c.credits,0)
  const creditsLeft = Math.max(0,totalRequired-creditsDone)
  const progressPct = Math.min(100,(creditsDone/totalRequired)*100)
  const semsLeft = Math.ceil(creditsLeft/15)

  const addCourse = () => {
    if (!form.code||!form.name) return
    setCompleted(p=>[...p,{...form,id:Date.now().toString(),credits:Number(form.credits)}])
    setForm({code:'',name:'',credits:3,grade:'A',semester:SEMESTERS[SEMESTERS.length-1]})
    setCodeInput('')
    setSuggestions([])
    setShowAdd(false)
  }

  const handleCodeChange = (val: string) => {
    setCodeInput(val)
    setForm(p=>({...p,code:val}))
    if (val.length>1) setSuggestions(BRACU_COURSES.filter(c=>c.code.toLowerCase().includes(val.toLowerCase())||c.name.toLowerCase().includes(val.toLowerCase())).slice(0,5))
    else setSuggestions([])
  }

  const selectSuggestion = (c: typeof BRACU_COURSES[0]) => {
    setForm(p=>({...p,code:c.code,name:c.name,credits:c.credits}))
    setCodeInput(c.code)
    setSuggestions([])
  }

  const bySemester = SEMESTERS.map(sem=>({
    sem, courses: completed.filter(c=>c.semester===sem), credits: completed.filter(c=>c.semester===sem).reduce((a,c)=>a+c.credits,0)
  })).filter(s=>s.courses.length>0)

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 10px', outline: 'none', width: '100%' }

  return (
    <PageLayout eyebrow="Credit Tracker" title="Track your credits.<br/>Know when you graduate." subtitle="Add completed courses and track progress toward graduation.">

      {/* Dept selector */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {Object.keys(DEPT_REQUIREMENTS).map(d=>(
          <button key={d} onClick={()=>setDept(d)}
            style={{ background: dept===d?'var(--red)':'transparent', color: dept===d?'var(--paper)':'var(--faded)', border: `1px solid ${dept===d?'var(--red)':'var(--border)'}`, padding: '6px 12px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {d}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px', marginBottom: '16px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '48px', color: '#5fd49a', letterSpacing: '2px', lineHeight: 1 }}>{creditsDone}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '48px', color: 'var(--red)', letterSpacing: '2px', lineHeight: 1 }}>{creditsLeft}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>remaining</div>
          </div>
        </div>
        <div style={{ background: 'rgba(242,237,228,0.06)', height: '8px', marginBottom: '6px' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#5fd49a,var(--red))', width: `${progressPct}%`, transition: 'width .5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>
          <span>0</span>
          <span style={{ color: 'var(--paper)', fontWeight: 700 }}>{progressPct.toFixed(1)}% · ~{semsLeft} sems left</span>
          <span>{totalRequired} ({dept})</span>
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
        {(['progress','history'] as const).map(v=>(
          <button key={v} onClick={()=>setActiveView(v)}
            style={{ flex: 1, padding: '10px', background: activeView===v?'var(--red)':'var(--ink2)', color: activeView===v?'var(--paper)':'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {v==='progress'?'📊 Progress':'📋 History'}
          </button>
        ))}
      </div>

      {activeView==='progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
          {[
            { label: 'Freshman Complete', credits: 30 },
            { label: 'Sophomore Complete', credits: 60 },
            { label: 'Junior Complete', credits: 90 },
            { label: 'Senior Status', credits: 110 },
            { label: 'Graduation', credits: totalRequired },
          ].map((m,i)=>(
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--ink)', border: '1px solid var(--border)' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: creditsDone>=m.credits?'#5fd49a':'var(--dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, color: 'var(--ink)' }}>
                {creditsDone>=m.credits?'✓':''}
              </div>
              <div style={{ flex: 1, fontSize: '12px', color: creditsDone>=m.credits?'var(--paper)':'var(--faded)' }}>{m.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--faded)' }}>{m.credits}cr</div>
              {creditsDone<m.credits && <div style={{ fontSize: '9px', color: 'var(--red)' }}>{m.credits-creditsDone} left</div>}
            </div>
          ))}
        </div>
      )}

      {activeView==='history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
          {bySemester.map(s=>(
            <div key={s.sem} style={{ background: 'var(--ink)', border: '1px solid var(--border)' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', background: 'var(--ink2)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)' }}>{s.sem}</div>
                <div style={{ fontSize: '10px', color: 'var(--red)' }}>{s.credits} credits</div>
              </div>
              {s.courses.map(c=>(
                <div key={c.id} style={{ padding: '9px 14px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid rgba(242,237,228,0.04)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--red)', width: '58px', flexShrink: 0 }}>{c.code}</div>
                  <div style={{ flex: 1, fontSize: '10px', color: 'var(--faded)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--faded)', flexShrink: 0 }}>{c.credits}cr</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, flexShrink: 0, color: c.grade.startsWith('A')?'#5fd49a':c.grade.startsWith('B')?'var(--paper)':c.grade==='F'?'var(--red)':'var(--bronze)' }}>{c.grade}</div>
                  <button onClick={()=>setCompleted(p=>p.filter(x=>x.id!==c.id))}
                    style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '11px', cursor: 'crosshair', flexShrink: 0 }}
                    onMouseEnter={e=>(e.currentTarget.style.color='var(--red)')}
                    onMouseLeave={e=>(e.currentTarget.style.color='var(--faded)')}>✕</button>
                </div>
              ))}
            </div>
          ))}
          {completed.length===0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>No courses added yet.</div>}
        </div>
      )}

      {/* Add course */}
      <button onClick={()=>setShowAdd(p=>!p)}
        style={{ width: '100%', background: 'transparent', border: '1px dashed rgba(242,237,228,0.15)', color: 'var(--faded)', padding: '11px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', marginBottom: showAdd?'8px':'0' }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--red)';(e.currentTarget as HTMLElement).style.color='var(--red)'}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(242,237,228,0.15)';(e.currentTarget as HTMLElement).style.color='var(--faded)'}}>
        + Add Completed Course
      </button>

      {showAdd && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '16px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Code</label>
              <input style={inp} placeholder="CSE220" value={codeInput} onChange={e=>handleCodeChange(e.target.value)} onBlur={()=>setTimeout(()=>setSuggestions([]),200)} />
              {suggestions.length>0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--ink2)', border: '1px solid var(--border)', zIndex: 100 }}>
                  {suggestions.map(c=>(
                    <div key={c.code} onClick={()=>selectSuggestion(c)}
                      style={{ padding: '7px 10px', fontSize: '10px', color: 'var(--faded)', cursor: 'crosshair', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='rgba(242,237,228,0.03)')}
                      onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                      <span style={{ color: 'var(--red)' }}>{c.code}</span> — {c.name} ({c.credits}cr)
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Name</label>
              <input style={inp} placeholder="Data Structures" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Credits</label>
              <select style={inp} value={form.credits} onChange={e=>setForm(p=>({...p,credits:parseInt(e.target.value)}))}>
                {[1,2,3,4,6].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Grade</label>
              <select style={inp} value={form.grade} onChange={e=>setForm(p=>({...p,grade:e.target.value}))}>
                {GRADES.map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '5px', fontWeight: 700 }}>Semester</label>
              <select style={inp} value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))}>
                {SEMESTERS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button onClick={addCourse} style={{ width: '100%', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '11px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Add Course →
          </button>
        </div>
      )}

      {/* Graduation forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '16px' }}>
        {[
          { label: 'Credits Done', val: creditsDone, color: '#5fd49a' },
          { label: 'Credits Left', val: creditsLeft, color: 'var(--red)' },
          { label: 'Semesters Left', val: `~${semsLeft}`, color: 'var(--bronze)' },
          { label: 'Courses Done', val: completed.length, color: 'var(--paper)' },
        ].map((s,i)=>(
          <div key={i} style={{ background: 'var(--ink)', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: s.color, letterSpacing: '1px', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}