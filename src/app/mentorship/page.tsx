'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Mentor {
  id: string
  studentId: string
  name: string
  dept: string
  semester: number
  cgpa: number
  skills: string[]
  courses: string[]
  bio: string
  contact: string
  contactType: 'email' | 'whatsapp' | 'both'
  available: boolean
  sessions: number
  rating: number
  reviews: number
  interests: string[]
}

const MOCK_MENTORS: Mentor[] = [
  {
    id: '1', studentId: '19301***', name: 'Senior A', dept: 'CSE', semester: 12, cgpa: 3.87,
    skills: ['DSA', 'Machine Learning', 'Python', 'Research'],
    courses: ['CSE220', 'CSE221', 'CSE482', 'CSE499'],
    bio: 'Final year CSE student. Did research under Dr. Golam Rabiul Alam. Interned at Brain Station 23. Happy to guide juniors on academics, research, and career paths.',
    contact: 'senior.a@bracu.ac.bd', contactType: 'both', available: true, sessions: 47, rating: 4.9, reviews: 23,
    interests: ['AI/ML', 'Research', 'Software Engineering']
  },
  {
    id: '2', studentId: '20201***', name: 'Senior B', dept: 'CSE', semester: 10, cgpa: 3.72,
    skills: ['Web Development', 'React', 'Node.js', 'System Design'],
    courses: ['CSE370', 'CSE471', 'CSE482'],
    bio: 'Senior CSE student. Full stack developer. Freelanced for 2 years. Can help with web dev, career planning, and navigating BRACU\'s academic system.',
    contact: '+880 1700-000000', contactType: 'whatsapp', available: true, sessions: 31, rating: 4.7, reviews: 18,
    interests: ['Full Stack', 'Freelancing', 'Career']
  },
  {
    id: '3', studentId: '20401***', name: 'Senior C', dept: 'CSE', semester: 10, cgpa: 3.65,
    skills: ['Competitive Programming', 'Algorithms', 'C++', 'Problem Solving'],
    courses: ['CSE220', 'CSE221', 'CSE340'],
    bio: 'ICPC regional contestant. Can help with DSA, competitive programming, and algorithm courses. Tutored 30+ students in CSE220 and CSE221.',
    contact: 'senior.c@bracu.ac.bd', contactType: 'email', available: true, sessions: 62, rating: 4.8, reviews: 31,
    interests: ['Competitive Programming', 'Algorithms', 'ICPC']
  },
  {
    id: '4', studentId: '21101***', name: 'Senior D', dept: 'EEE', semester: 8, cgpa: 3.78,
    skills: ['Circuit Design', 'Embedded Systems', 'Arduino', 'MATLAB'],
    courses: ['EEE201', 'EEE301', 'EEE401'],
    bio: 'EEE senior. Can help juniors with circuit analysis, embedded systems, and navigating the EEE curriculum. Also good at MATLAB and simulation.',
    contact: '+880 1800-000000', contactType: 'whatsapp', available: true, sessions: 19, rating: 4.6, reviews: 12,
    interests: ['Embedded Systems', 'IoT', 'Robotics']
  },
  {
    id: '5', studentId: '20301***', name: 'Senior E', dept: 'CSE', semester: 11, cgpa: 3.91,
    skills: ['Cybersecurity', 'Networking', 'Linux', 'Penetration Testing'],
    courses: ['CSE445', 'CSE471', 'CSE341'],
    bio: 'CEH certified. Interned at a cybersecurity firm. Can guide on networks, security, and career paths in cybersecurity. Very passionate about this field.',
    contact: 'senior.e@bracu.ac.bd', contactType: 'both', available: false, sessions: 28, rating: 4.8, reviews: 15,
    interests: ['Cybersecurity', 'Networking', 'Linux']
  },
  {
    id: '6', studentId: '21301***', name: 'Senior F', dept: 'BBA', semester: 8, cgpa: 3.55,
    skills: ['Business Strategy', 'Marketing', 'Excel', 'Data Analysis'],
    courses: ['BUS201', 'MKT301', 'FIN201'],
    bio: 'BBA senior with focus on marketing. Can guide BBA juniors on course selection, internships at marketing agencies, and career in business.',
    contact: '+880 1900-000000', contactType: 'whatsapp', available: true, sessions: 14, rating: 4.5, reviews: 9,
    interests: ['Marketing', 'Business', 'Startups']
  },
]

const ROADMAPS = [
  {
    title: 'Path to Software Engineer at Top BD Companies',
    dept: 'CSE', semesters: '1–8',
    steps: [
      { sem: '1–2', title: 'Foundation', desc: 'Master C/C++ basics. Start competitive programming on Codeforces. Take CSE110, CSE111 seriously.' },
      { sem: '3–4', title: 'Core DSA', desc: 'CSE220 is the most important course. Practice LeetCode daily. Learn time complexity analysis.' },
      { sem: '5–6', title: 'Internship Ready', desc: 'Build 2–3 real projects. Learn Git, REST APIs, one framework (React or Django). Apply for internships.' },
      { sem: '7–8', title: 'Job Ready', desc: 'System design basics. Interview preparation. Contribute to open source. Network on LinkedIn.' },
    ]
  },
  {
    title: 'Path to ML/AI Research & Industry',
    dept: 'CSE', semesters: '3–10',
    steps: [
      { sem: '3–4', title: 'Math Foundation', desc: 'MAT215 Linear Algebra is crucial. Learn probability & statistics. Python fundamentals.' },
      { sem: '5–6', title: 'ML Basics', desc: 'Take CSE421 or CSE482. Kaggle competitions. Learn scikit-learn, pandas, numpy.' },
      { sem: '7–8', title: 'Deep Learning', desc: 'PyTorch or TensorFlow. Research papers. Contact faculty for research opportunities.' },
      { sem: '9–10', title: 'Thesis/Industry', desc: 'CSE499 thesis in ML. Apply to grad schools or ML engineer roles at startups.' },
    ]
  },
  {
    title: 'Path to Full Stack Developer',
    dept: 'CSE', semesters: '2–6',
    steps: [
      { sem: '2–3', title: 'Web Basics', desc: 'HTML, CSS, JavaScript. Build small projects. Learn React basics alongside coursework.' },
      { sem: '3–4', title: 'Backend', desc: 'Node.js or Django. PostgreSQL or MongoDB. REST API design. Deploy on Vercel/Render.' },
      { sem: '4–5', title: 'Freelancing', desc: 'Take your first freelance project. Fiverr or Upwork. Build a portfolio site.' },
      { sem: '5–6', title: 'Internship', desc: 'Apply to web dev internships. Brain Station 23, Kaz, DevTechnosys hire from BRACU.' },
    ]
  },
]

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>(MOCK_MENTORS)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [filter, setFilter] = useState<'all' | 'available'>('available')
  const [activeTab, setActiveTab] = useState<'mentors' | 'roadmaps' | 'become'>('mentors')
  const [connectModal, setConnectModal] = useState<Mentor | null>(null)
  const [selectedRoadmap, setSelectedRoadmap] = useState<number | null>(0)
  const [becomeForm, setBecomeForm] = useState({
    dept: 'CSE', semester: '', cgpa: '', skills: '', courses: '', bio: '', contact: '', contactType: 'email'
  })
  const [submitted, setSubmitted] = useState(false)

  const depts = ['All', ...Array.from(new Set(MOCK_MENTORS.map(m => m.dept)))]

  const filtered = mentors
    .filter(m => dept === 'All' || m.dept === dept)
    .filter(m => filter === 'all' || m.available)
    .filter(m => !search || ([...m.skills, ...m.courses, ...m.interests].join(' ') + ' ' + m.bio).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.rating - a.rating)

  const submitBecomeForm = () => {
    if (!becomeForm.semester || !becomeForm.bio) return
    setSubmitted(true)
  }

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Senior Mentorship"
      title="Learn from those<br/>who walked this path."
      subtitle="Connect with seniors who've taken your courses, landed internships, and navigated BRACU. Real guidance, not generic advice."
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '24px' }}>
        {([['mentors', '👥 Find Mentors'], ['roadmaps', '🗺️ Roadmaps'], ['become', '⭐ Become a Mentor']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, padding: '11px', background: activeTab === t ? 'var(--red)' : 'var(--ink2)', color: activeTab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', borderBottom: activeTab === t ? '1px solid var(--red)' : '1px solid var(--border)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* MENTORS TAB */}
      {activeTab === 'mentors' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none' }}
              placeholder="Search by skill, course, interest..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '2px' }}>
              {(['all', 'available'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '9px 14px', background: filter === f ? 'var(--red)' : 'transparent', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${filter === f ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                  {f === 'all' ? 'All' : '🟢 Available'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {depts.map(d => (
              <button key={d} onClick={() => setDept(d)}
                style={{ padding: '6px 14px', background: dept === d ? 'var(--red)' : 'transparent', color: dept === d ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${dept === d ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.map(m => (
              <div key={m.id}
                style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px', transition: 'background .15s', opacity: m.available ? 1 : 0.6 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'start' }}>
                  {/* Avatar */}
                  <div style={{ width: '48px', height: '48px', background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: 'var(--red)', letterSpacing: '1px', flexShrink: 0 }}>
                    {m.name.split(' ')[1]?.[0] || m.name[0]}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)' }}>{m.name}</span>
                      <span style={{ fontSize: '9px', color: m.available ? '#5fd49a' : 'var(--faded)', letterSpacing: '1px' }}>
                        {m.available ? '● Available' : '○ Unavailable'}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '8px', letterSpacing: '.5px' }}>
                      {m.dept} · Semester {m.semester} · CGPA {m.cgpa}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '10px', maxWidth: '480px' }}>{m.bio}</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {m.skills.map((s, i) => (
                        <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid rgba(232,57,14,0.2)', padding: '2px 8px', color: 'rgba(232,57,14,0.7)' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--faded)' }}>
                      Courses: <span style={{ color: 'var(--bronze)' }}>{m.courses.join(', ')}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: 'var(--red)', letterSpacing: '1px', lineHeight: 1 }}>{m.rating}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', marginBottom: '4px' }}>{m.reviews} reviews</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>{m.sessions} sessions</div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <button onClick={() => setConnectModal(m)} disabled={!m.available}
                    style={{ background: m.available ? 'var(--red)' : 'var(--dim)', color: 'var(--paper)', border: 'none', padding: '8px 20px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: m.available ? 'crosshair' : 'not-allowed', transition: 'all .15s' }}>
                    {m.available ? 'Connect →' : 'Unavailable'}
                  </button>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {m.interests.map((interest, i) => (
                      <span key={i} style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px' }}>#{interest.toLowerCase().replace(/ /g, '')}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ROADMAPS TAB */}
      {activeTab === 'roadmaps' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)' }}>
          {/* Roadmap list */}
          <div style={{ background: 'var(--ink)', padding: '0' }}>
            {ROADMAPS.map((r, i) => (
              <div key={i} onClick={() => setSelectedRoadmap(i)}
                style={{ padding: '16px 20px', cursor: 'crosshair', borderBottom: '1px solid var(--border)', background: selectedRoadmap === i ? 'var(--ink2)' : 'transparent', borderLeft: selectedRoadmap === i ? '2px solid var(--red)' : '2px solid transparent', transition: 'all .15s' }}>
                <div style={{ fontSize: '9px', color: 'var(--red)', letterSpacing: '1px', marginBottom: '4px' }}>{r.dept} · Sem {r.semesters}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.4 }}>{r.title}</div>
              </div>
            ))}
          </div>

          {/* Roadmap detail */}
          {selectedRoadmap !== null && (
            <div style={{ background: 'var(--ink2)', padding: '24px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '8px', fontWeight: 700 }}>// ROADMAP</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '24px', lineHeight: 1.2 }}>
                {ROADMAPS[selectedRoadmap].title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {ROADMAPS[selectedRoadmap].steps.map((step, i) => (
                  <div key={i} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', gap: '16px' }}>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '11px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '4px' }}>SEM {step.sem}</div>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(232,57,14,0.1)', border: '1px solid rgba(232,57,14,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--red)' }}>{i + 1}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '6px' }}>{step.title}</div>
                      <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BECOME MENTOR TAB */}
      {activeTab === 'become' && (
        <div style={{ maxWidth: '600px' }}>
          {submitted ? (
            <div style={{ background: 'rgba(95,212,154,0.08)', border: '1px solid rgba(95,212,154,0.25)', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: '#5fd49a', letterSpacing: '2px', marginBottom: '8px' }}>Application Submitted!</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8 }}>Your mentor profile has been submitted for review. You'll be added to the mentor directory within 24 hours. Thank you for helping your juniors!</p>
            </div>
          ) : (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '6px', fontWeight: 700 }}>// Become a Mentor</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '20px' }}>Share your experience with juniors. You were once in their position. Be the senior you never had.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={lbl}>Department</label>
                  <select style={inp} value={becomeForm.dept} onChange={e => setBecomeForm(p => ({ ...p, dept: e.target.value }))}>
                    {['CSE', 'EEE', 'BBA', 'ECO', 'PHR', 'ARC', 'LAW'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Current Semester</label>
                  <input style={inp} type="number" placeholder="8" min="5" max="12" value={becomeForm.semester} onChange={e => setBecomeForm(p => ({ ...p, semester: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>CGPA</label>
                  <input style={inp} type="number" placeholder="3.50" min="2.5" max="4.0" step="0.01" value={becomeForm.cgpa} onChange={e => setBecomeForm(p => ({ ...p, cgpa: e.target.value }))} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={lbl}>Skills (comma separated)</label>
                <input style={inp} placeholder="Python, Machine Learning, Web Dev..." value={becomeForm.skills} onChange={e => setBecomeForm(p => ({ ...p, skills: e.target.value }))} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={lbl}>Courses You Can Mentor (comma separated)</label>
                <input style={inp} placeholder="CSE220, CSE221, MAT215..." value={becomeForm.courses} onChange={e => setBecomeForm(p => ({ ...p, courses: e.target.value }))} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={lbl}>Bio — Tell juniors about yourself</label>
                <textarea value={becomeForm.bio} onChange={e => setBecomeForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Share your experience, internships, research, what you can help with..."
                  rows={4}
                  style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={lbl}>Contact (Email or WhatsApp)</label>
                  <input style={inp} placeholder="your@bracu.ac.bd or +880..." value={becomeForm.contact} onChange={e => setBecomeForm(p => ({ ...p, contact: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Type</label>
                  <select style={{ ...inp, width: 'auto' }} value={becomeForm.contactType} onChange={e => setBecomeForm(p => ({ ...p, contactType: e.target.value }))}>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '16px', padding: '10px 14px', background: 'rgba(242,237,228,0.02)', border: '1px solid var(--border)', lineHeight: 1.8 }}>
                ✓ Minimum semester 5 to become a mentor<br />
                ✓ Your contact will only be visible to logged-in students<br />
                ✓ You can set yourself as unavailable anytime
              </div>

              <button onClick={submitBecomeForm}
                style={{ width: '100%', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Submit Mentor Application →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Connect Modal */}
      {connectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,11,9,0.88)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={e => e.target === e.currentTarget && setConnectModal(null)}>
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)' }}>{connectModal.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '2px' }}>{connectModal.dept} · Sem {connectModal.semester} · CGPA {connectModal.cgpa}</div>
              </div>
              <button onClick={() => setConnectModal(null)} style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '18px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// Connect</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(connectModal.contactType === 'email' || connectModal.contactType === 'both') && (
                  <a href={`mailto:${connectModal.contact}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', textDecoration: 'none', transition: 'all .15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                    <span style={{ fontSize: '18px' }}>📧</span>
                    <div>
                      <div style={{ fontSize: '12px' }}>{connectModal.contact}</div>
                      <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>Send an email</div>
                    </div>
                  </a>
                )}
                {(connectModal.contactType === 'whatsapp' || connectModal.contactType === 'both') && (
                  <a href={`https://wa.me/${connectModal.contact.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', textDecoration: 'none', transition: 'all .15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(95,212,154,0.4)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
                    <span style={{ fontSize: '18px' }}>💬</span>
                    <div>
                      <div style={{ fontSize: '12px' }}>{connectModal.contact}</div>
                      <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px' }}>Message on WhatsApp</div>
                    </div>
                  </a>
                )}
              </div>
              <div style={{ marginTop: '16px', fontSize: '10px', color: 'var(--faded)', lineHeight: 1.8, borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                Be respectful. Introduce yourself, mention your semester and what you need help with. Seniors volunteer their time.
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}