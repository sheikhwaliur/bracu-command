'use client'
import { useState, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface ResumeData {
  name: string
  studentId: string
  email: string
  phone: string
  linkedin: string
  github: string
  dept: string
  semester: string
  cgpa: string
  skills: string
  courses: string
  projects: string
  experience: string
  interests: string
  achievements: string
}

const TEMPLATES = [
  { id: 'technical', name: 'Technical / SWE', desc: 'For software engineering roles. Emphasizes skills, projects, and GitHub.' },
  { id: 'research', name: 'Research / Academic', desc: 'For research positions and grad school. Emphasizes publications and academics.' },
  { id: 'business', name: 'Business / General', desc: 'For business analyst, consultant, or general roles.' },
]

const SUGGESTED_SKILLS: Record<string, string[]> = {
  CSE: ['Python', 'C++', 'Java', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Linux', 'Machine Learning', 'Data Structures', 'Algorithms'],
  EEE: ['MATLAB', 'Circuit Design', 'Arduino', 'Embedded Systems', 'VHDL', 'PCB Design', 'Python', 'Signal Processing'],
  BBA: ['Excel', 'PowerPoint', 'Financial Analysis', 'Market Research', 'Project Management', 'Data Analysis', 'Communication'],
}

function generateResume(data: ResumeData, template: string): string {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean)
  const courses = data.courses.split(',').map(c => c.trim()).filter(Boolean)
  const projects = data.projects.split('\n').filter(Boolean)
  const experience = data.experience.split('\n').filter(Boolean)
  const achievements = data.achievements.split('\n').filter(Boolean)

  if (template === 'technical') {
    return `${data.name.toUpperCase()}
${data.email} | ${data.phone} | linkedin.com/in/${data.linkedin} | github.com/${data.github}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAC University, Dhaka, Bangladesh
B.Sc. in ${data.dept} | Expected Graduation: 2026
CGPA: ${data.cgpa}/4.00 | Student ID: ${data.studentId}

Relevant Coursework: ${courses.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${skills.join(' · ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${projects.length > 0 ? projects.map(p => `• ${p}`).join('\n') : '• [Add your projects — describe what you built, what tech you used, and the impact]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${experience.length > 0 ? experience.map(e => `• ${e}`).join('\n') : '• [Add internships, part-time work, or research experience]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACHIEVEMENTS & ACTIVITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${achievements.length > 0 ? achievements.map(a => `• ${a}`).join('\n') : '• [Add competitions, clubs, volunteering, certifications]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.interests || 'Open Source Development · Competitive Programming · Machine Learning Research'}`
  }

  if (template === 'research') {
    return `${data.name.toUpperCase()}
${data.email} | ${data.phone}
BRAC University, Dhaka | Student ID: ${data.studentId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESEARCH INTERESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.interests || 'Machine Learning · Natural Language Processing · Computer Vision'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B.Sc. in ${data.dept} — BRAC University
CGPA: ${data.cgpa}/4.00 | Semester ${data.semester}
Relevant Coursework: ${courses.join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESEARCH EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${experience.length > 0 ? experience.map(e => `• ${e}`).join('\n') : '• [Add research projects, thesis work, or lab work]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECTS & PUBLICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${projects.length > 0 ? projects.map(p => `• ${p}`).join('\n') : '• [Add research projects or publications]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${skills.join(' · ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACHIEVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${achievements.length > 0 ? achievements.map(a => `• ${a}`).join('\n') : '• [Add awards, scholarships, or academic honors]'}`
  }

  // business template
  return `${data.name.toUpperCase()}
${data.email} | ${data.phone} | linkedin.com/in/${data.linkedin}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Motivated ${data.dept} student at BRAC University with strong analytical and communication skills, seeking opportunities to contribute to dynamic organizations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B.Sc. in ${data.dept} — BRAC University, Dhaka
CGPA: ${data.cgpa}/4.00 | Semester ${data.semester}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${experience.length > 0 ? experience.map(e => `• ${e}`).join('\n') : '• [Add work experience, internships, or part-time roles]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${skills.join(' · ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACHIEVEMENTS & ACTIVITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${achievements.length > 0 ? achievements.map(a => `• ${a}`).join('\n') : '• [Add leadership roles, volunteering, or club activities]'}`
}

export default function ResumePage() {
  const [template, setTemplate] = useState('technical')
  const [step, setStep] = useState(1)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const resumeRef = useRef<HTMLPreElement>(null)

  const [data, setData] = useState<ResumeData>({
    name: '', studentId: '', email: '', phone: '', linkedin: '', github: '',
    dept: 'CSE', semester: '', cgpa: '',
    skills: '', courses: '', projects: '', experience: '', interests: '', achievements: '',
  })

  const update = (field: keyof ResumeData, value: string) =>
    setData(p => ({ ...p, [field]: value }))

  const resume = generateResume(data, template)

  const copyResume = () => {
    navigator.clipboard.writeText(resume)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }
  const ta: React.CSSProperties = { ...inp, resize: 'none', lineHeight: 1.7 }

  return (
    <PageLayout
      eyebrow="AI Resume Builder"
      title="Build your resume.<br/>Land your first role."
      subtitle="Fill in your details and get a professionally formatted resume instantly. Tailored for BRACU students."
    >
      {/* Template selector */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', fontWeight: 700 }}>// Choose Template</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: 'var(--border)' }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)}
              style={{ background: template === t.id ? 'rgba(232,57,14,0.08)' : 'var(--ink)', border: 'none', borderBottom: `2px solid ${template === t.id ? 'var(--red)' : 'transparent'}`, padding: '16px', textAlign: 'left', cursor: 'crosshair', transition: 'all .15s', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: template === t.id ? 'var(--red)' : 'var(--paper)' }}>{t.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.6 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
        {['Personal Info', 'Academic', 'Experience & Skills', 'Preview'].map((s, i) => (
          <button key={i} onClick={() => setStep(i + 1)}
            style={{ flex: 1, padding: '8px', background: step === i + 1 ? 'var(--red)' : step > i + 1 ? 'rgba(95,212,154,0.1)' : 'var(--ink2)', color: step === i + 1 ? 'var(--paper)' : step > i + 1 ? '#5fd49a' : 'var(--faded)', border: 'none', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {step > i + 1 ? '✓ ' : `${i + 1}. `}{s}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: generated ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div>
          {/* STEP 1 — Personal */}
          {step === 1 && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '18px', fontWeight: 700 }}>// Personal Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={lbl}>Full Name</label><input style={inp} placeholder="Sheikh Waliur Rahman" value={data.name} onChange={e => update('name', e.target.value)} /></div>
                <div><label style={lbl}>Student ID</label><input style={inp} placeholder="22220000" value={data.studentId} onChange={e => update('studentId', e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><label style={lbl}>Email</label><input style={inp} placeholder="name@bracu.ac.bd" value={data.email} onChange={e => update('email', e.target.value)} /></div>
                <div><label style={lbl}>Phone</label><input style={inp} placeholder="+880 1700-000000" value={data.phone} onChange={e => update('phone', e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={lbl}>LinkedIn Username</label><input style={inp} placeholder="sheikhwaliur" value={data.linkedin} onChange={e => update('linkedin', e.target.value)} /></div>
                <div><label style={lbl}>GitHub Username</label><input style={inp} placeholder="sheikhwaliur" value={data.github} onChange={e => update('github', e.target.value)} /></div>
              </div>
              <button onClick={() => setStep(2)} style={{ marginTop: '16px', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '11px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Next →
              </button>
            </div>
          )}

          {/* STEP 2 — Academic */}
          {step === 2 && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '18px', fontWeight: 700 }}>// Academic Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Department</label>
                  <select style={inp} value={data.dept} onChange={e => update('dept', e.target.value)}>
                    {['CSE', 'EEE', 'BBA', 'ECO', 'PHR', 'ARC', 'LAW', 'ENG', 'MAT'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Current Semester</label><input style={inp} placeholder="8" value={data.semester} onChange={e => update('semester', e.target.value)} /></div>
                <div><label style={lbl}>CGPA</label><input style={inp} placeholder="3.72" value={data.cgpa} onChange={e => update('cgpa', e.target.value)} /></div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Relevant Courses (comma separated)</label>
                <input style={inp} placeholder="CSE220, CSE221, CSE482, MAT215" value={data.courses} onChange={e => update('courses', e.target.value)} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>Technical Skills (comma separated)</label>
                <input style={inp} placeholder="Python, React, Node.js, SQL, Git" value={data.skills} onChange={e => update('skills', e.target.value)} />
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', alignSelf: 'center' }}>Suggested:</span>
                  {(SUGGESTED_SKILLS[data.dept] || SUGGESTED_SKILLS.CSE).slice(0, 6).map(s => (
                    <button key={s}
                      onClick={() => update('skills', data.skills ? `${data.skills}, ${s}` : s)}
                      style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid var(--border)', padding: '2px 8px', color: 'var(--faded)', background: 'none', cursor: 'crosshair', transition: 'all .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '11px 20px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>← Back</button>
                <button onClick={() => setStep(3)} style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '11px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Experience */}
          {step === 3 && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '18px', fontWeight: 700 }}>// Experience & Achievements</div>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Projects (one per line)</label>
                <textarea style={ta} rows={4} placeholder="E-commerce website using React + Node.js — 500+ users&#10;ML model for Bangla text classification — 94% accuracy&#10;BRACU Command — student platform with 1000+ users" value={data.projects} onChange={e => update('projects', e.target.value)} />
                <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '4px' }}>Format: Project name — what you built and the impact</div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Work / Internship Experience (one per line)</label>
                <textarea style={ta} rows={3} placeholder="Software Engineering Intern at Brain Station 23 (Summer 2025) — built REST APIs&#10;Freelance Web Developer — 10+ client projects on Fiverr" value={data.experience} onChange={e => update('experience', e.target.value)} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Achievements & Activities (one per line)</label>
                <textarea style={ta} rows={3} placeholder="ICPC Regional Contestant 2024&#10;Dean's List — Spring 2024&#10;President, BRACU Computer Club" value={data.achievements} onChange={e => update('achievements', e.target.value)} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>Interests</label>
                <input style={inp} placeholder="Open Source, Machine Learning, Competitive Programming" value={data.interests} onChange={e => update('interests', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '11px 20px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>← Back</button>
                <button onClick={() => { setStep(4); setGenerated(true) }} style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '11px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                  Generate Resume →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Edit form still visible */}
          {step === 4 && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#5fd49a', marginBottom: '14px', fontWeight: 700 }}>✓ Resume Generated!</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '16px' }}>
                Your resume is ready. Copy it and paste into a Word doc or Google Doc to format it properly before submitting to employers.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={copyResume}
                  style={{ background: copied ? '#5fd49a' : 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '11px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair', transition: 'all .2s' }}>
                  {copied ? '✓ Copied!' : 'Copy Resume →'}
                </button>
                <button onClick={() => { setStep(1); setGenerated(false) }}
                  style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '11px 20px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                  Edit Details
                </button>
              </div>

              {/* Tips */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--ink)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>RESUME TIPS</div>
                {[
                  'Keep resume to 1 page for juniors, 2 pages for seniors',
                  'Use action verbs: Built, Developed, Implemented, Led, Designed',
                  'Add numbers where possible: "10,000 users", "40% faster", "95% accuracy"',
                  'Your GitHub matters more than your CGPA at most BD tech companies',
                  'Tailor your skills section for each job you apply to',
                ].map((tip, i) => (
                  <div key={i} style={{ fontSize: '10px', color: 'var(--faded)', padding: '5px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', lineHeight: 1.6 }}>
                    <span style={{ color: 'var(--red)', flexShrink: 0 }}>→</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resume preview */}
        {generated && step === 4 && (
          <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ink2)' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>Resume Preview</div>
              <button onClick={copyResume}
                style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', background: copied ? 'rgba(95,212,154,0.1)' : 'none', border: `1px solid ${copied ? 'rgba(95,212,154,0.3)' : 'var(--border)'}`, color: copied ? '#5fd49a' : 'var(--faded)', padding: '4px 12px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre ref={resumeRef}
              style={{ padding: '20px', fontSize: '10px', color: 'var(--faded)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace', overflowY: 'auto', maxHeight: '600px', wordBreak: 'break-word' }}>
              {resume}
            </pre>
          </div>
        )}
      </div>
    </PageLayout>
  )
}