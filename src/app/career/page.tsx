'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface CareerPath {
  id: string
  title: string
  icon: string
  desc: string
  avgSalary: string
  demand: 'Very High' | 'High' | 'Medium'
  skills: string[]
  courses: string[]
  timeline: string
  companies: string[]
  steps: { title: string; desc: string; timeline: string }[]
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: 'swe', title: 'Software Engineer', icon: '💻', demand: 'Very High',
    avgSalary: '60k–150k BDT/month', timeline: '6–12 months to first job',
    desc: 'Build software products used by millions. Most common path for CSE graduates.',
    skills: ['DSA', 'System Design', 'React/Node.js', 'SQL', 'Git', 'REST APIs'],
    courses: ['CSE220', 'CSE221', 'CSE260', 'CSE370'],
    companies: ['Brain Station 23', 'Kaz Software', 'BJIT', 'Pathao', 'Shajgoj'],
    steps: [
      { title: 'Master DSA', desc: 'LeetCode daily. Focus on arrays, trees, graphs, DP. This is what gets you through technical interviews.', timeline: 'Sem 3–5' },
      { title: 'Build Projects', desc: 'Build 2–3 real full-stack projects. Deploy them. Put them on GitHub.', timeline: 'Sem 5–6' },
      { title: 'Internship', desc: 'Apply to BD tech companies. Brain Station 23, Kaz, BJIT all hire BRACU students.', timeline: 'Sem 6–7' },
      { title: 'Full-time Job', desc: 'Convert internship or apply fresh. Negotiate — the market is good right now.', timeline: 'Sem 8+' },
    ]
  },
  {
    id: 'ml', title: 'ML / AI Engineer', icon: '🤖', demand: 'Very High',
    avgSalary: '80k–200k BDT/month', timeline: '1–2 years of focused study',
    desc: 'Build machine learning models and AI systems. Fastest growing field globally.',
    skills: ['Python', 'PyTorch/TensorFlow', 'Linear Algebra', 'Statistics', 'Data Analysis'],
    courses: ['MAT215', 'MAT311', 'CSE421', 'CSE482'],
    companies: ['Samsung R&D', 'Intelligent Machines', 'Chaldal', 'Shohoz', 'Research Labs'],
    steps: [
      { title: 'Math Foundation', desc: 'MAT215 is critical. Learn probability and statistics deeply. These are the building blocks.', timeline: 'Sem 3–4' },
      { title: 'ML Fundamentals', desc: 'Take CSE482. Do Kaggle competitions. Learn scikit-learn, pandas, numpy.', timeline: 'Sem 5–6' },
      { title: 'Deep Learning', desc: 'PyTorch or TensorFlow. Read papers. Contact faculty for research opportunities.', timeline: 'Sem 7–8' },
      { title: 'Specialize', desc: 'Pick NLP, Computer Vision, or RL. Build a portfolio of ML projects.', timeline: 'Sem 8+' },
    ]
  },
  {
    id: 'fullstack', title: 'Full Stack Developer', icon: '🌐', demand: 'Very High',
    avgSalary: '50k–120k BDT/month', timeline: '3–6 months to freelance',
    desc: 'Build complete web apps from frontend to backend. Fastest path to income.',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    courses: ['CSE370', 'CSE260', 'CSE471'],
    companies: ['Freelance', 'Startups', 'Digital agencies', 'Remote companies'],
    steps: [
      { title: 'Frontend Basics', desc: 'HTML, CSS, JavaScript. Build small projects. Learn React.', timeline: 'Sem 2–3' },
      { title: 'Backend & DB', desc: 'Node.js or Django. PostgreSQL. REST API design. Deploy on Vercel/Render.', timeline: 'Sem 3–5' },
      { title: 'Start Freelancing', desc: 'First client is hardest. Fiverr or direct network. Build a portfolio site.', timeline: 'Sem 4–6' },
      { title: 'Scale Up', desc: 'Take bigger projects. Build SaaS products. Target international clients.', timeline: 'Sem 6+' },
    ]
  },
  {
    id: 'cybersec', title: 'Cybersecurity Engineer', icon: '🔐', demand: 'High',
    avgSalary: '70k–160k BDT/month', timeline: '1 year + certifications',
    desc: 'Protect systems from attacks. One of the highest-paying fields in tech.',
    skills: ['Networking', 'Linux', 'Python', 'Penetration Testing', 'Cryptography'],
    courses: ['CSE341', 'CSE445', 'CSE471'],
    companies: ['BGD e-GOV CIRT', 'Banks & Financial orgs', 'International remote roles'],
    steps: [
      { title: 'Networking & Linux', desc: 'CSE471 and OS fundamentals. Learn Linux CLI deeply. Set up a home lab.', timeline: 'Sem 4–5' },
      { title: 'Security Basics', desc: 'Learn common vulnerabilities (OWASP Top 10). Do CTF challenges on HackTheBox.', timeline: 'Sem 5–6' },
      { title: 'Certify', desc: 'CEH or CompTIA Security+. These open doors. OSCP for penetration testing roles.', timeline: 'Sem 7–8' },
      { title: 'Specialize', desc: 'AppSec, Network Security, or Cloud Security. Apply to banks or remote companies.', timeline: 'Sem 8+' },
    ]
  },
  {
    id: 'devops', title: 'DevOps / Cloud Engineer', icon: '☁️', demand: 'High',
    avgSalary: '80k–180k BDT/month', timeline: '1 year of hands-on practice',
    desc: 'Deploy and scale software infrastructure. Growing rapidly in BD with remote opportunities.',
    skills: ['Linux', 'Docker', 'Kubernetes', 'AWS/GCP', 'CI/CD', 'Terraform'],
    courses: ['CSE341', 'CSE471'],
    companies: ['Remote global companies', 'Grameenphone', 'BRAC Bank', 'Tech startups'],
    steps: [
      { title: 'Linux & Bash', desc: 'Get comfortable with the terminal. Automate everything with bash scripts.', timeline: 'Sem 4–5' },
      { title: 'Containers', desc: 'Docker fundamentals. Kubernetes basics. Deploy your own apps.', timeline: 'Sem 5–7' },
      { title: 'Cloud Platform', desc: 'AWS or GCP free tier. Get AWS Solutions Architect certification.', timeline: 'Sem 6–8' },
      { title: 'CI/CD & IaC', desc: 'GitHub Actions, Jenkins, Terraform. Build full deployment pipelines.', timeline: 'Sem 8+' },
    ]
  },
  {
    id: 'research', title: 'Research / Academia', icon: '🔬', demand: 'Medium',
    avgSalary: 'Stipend → 100k+ after PhD',
    timeline: '4–6 years (MS + PhD)',
    desc: 'Push the boundaries of CS knowledge. Requires strong academic performance.',
    skills: ['Research methodology', 'LaTeX', 'Python', 'Math', 'Technical writing'],
    courses: ['CSE499', 'CSE482', 'MAT215', 'MAT311'],
    companies: ['Universities', 'Microsoft Research', 'Google Research', 'BUET', 'BRACU'],
    steps: [
      { title: 'Build GPA', desc: 'Aim for 3.7+. Research positions require strong academics. MAT courses matter most.', timeline: 'Sem 1–6' },
      { title: 'Research Assistant', desc: 'Email BRACU faculty (Dr. Kaykobad, Dr. Shatabda, Dr. Alam) for RA positions.', timeline: 'Sem 5–7' },
      { title: 'Publish', desc: 'Co-author a paper with your supervisor. Even a workshop paper opens MS admission doors.', timeline: 'Sem 7–8' },
      { title: 'Apply for MS', desc: 'IELTS + GRE + 3 strong recommendation letters. Target US, Canada, Germany, Australia.', timeline: 'Sem 8' },
    ]
  },
]

const QUESTIONS = [
  { id: 'q1', question: 'What excites you most?', options: ['Building products users love', 'Solving complex math/AI problems', 'Making things fast and secure', 'Doing research and publishing'] },
  { id: 'q2', question: 'How is your math (MAT215 type)?', options: ['Strong — I enjoy it', 'Average — can manage', 'Weak — prefer practical stuff', 'Building it up'] },
  { id: 'q3', question: 'What\'s your goal after graduation?', options: ['Job at a BD tech company', 'Freelance / own startup', 'Research / grad school abroad', 'Remote job globally'] },
  { id: 'q4', question: 'Which do you prefer?', options: ['Frontend (what users see)', 'Backend (servers, databases)', 'Both equally', 'Infrastructure / systems'] },
  { id: 'q5', question: 'Timeline to employment?', options: ['ASAP — I need income fast', '1 year — I can invest time', '2+ years — I\'m in for the long game', 'Flexible'] },
]

export default function CareerPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [mode, setMode] = useState<'explore' | 'quiz' | 'result'>('explore')
  const [selected, setSelected] = useState<CareerPath | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizStep, setQuizStep] = useState(0)
  const [recommended, setRecommended] = useState<CareerPath[]>([])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const getRecommendations = () => {
    const scores: Record<string, number> = {}
    CAREER_PATHS.forEach(p => scores[p.id] = 0)

    const a = quizAnswers
    if (a['q1'] === 0) { scores['swe'] += 3; scores['fullstack'] += 2 }
    if (a['q1'] === 1) { scores['ml'] += 3; scores['research'] += 2 }
    if (a['q1'] === 2) { scores['cybersec'] += 3; scores['devops'] += 2 }
    if (a['q1'] === 3) { scores['research'] += 3; scores['ml'] += 1 }

    if (a['q2'] === 0) { scores['ml'] += 2; scores['research'] += 2 }
    if (a['q2'] === 2) { scores['fullstack'] += 2; scores['swe'] += 1 }

    if (a['q3'] === 0) { scores['swe'] += 2; scores['fullstack'] += 1 }
    if (a['q3'] === 1) { scores['fullstack'] += 3 }
    if (a['q3'] === 2) { scores['research'] += 3; scores['ml'] += 1 }
    if (a['q3'] === 3) { scores['devops'] += 2; scores['cybersec'] += 2 }

    if (a['q4'] === 0) { scores['fullstack'] += 2 }
    if (a['q4'] === 1) { scores['swe'] += 2; scores['devops'] += 1 }
    if (a['q4'] === 3) { scores['devops'] += 3; scores['cybersec'] += 2 }

    if (a['q5'] === 0) { scores['fullstack'] += 2; scores['swe'] += 1 }
    if (a['q5'] === 2) { scores['research'] += 2; scores['ml'] += 1 }

    const sorted = CAREER_PATHS.sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    setRecommended(sorted.slice(0, 3))
    setMode('result')
  }

  const demandColor = (d: string) => d === 'Very High' ? '#5fd49a' : d === 'High' ? 'var(--bronze)' : 'var(--faded)'

  const CardGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '2px', background: 'var(--border)' }}>
      {CAREER_PATHS.map(p => (
        <button key={p.id} onClick={() => setSelected(p)}
          style={{ background: selected?.id === p.id ? 'var(--ink2)' : 'var(--ink)', border: 'none', borderBottom: `2px solid ${selected?.id === p.id ? 'var(--red)' : 'transparent'}`, padding: '20px', textAlign: 'left', cursor: 'crosshair', transition: 'all .15s', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace' }}
          onMouseEnter={e => { if (selected?.id !== p.id) e.currentTarget.style.background = 'var(--ink2)' }}
          onMouseLeave={e => { if (selected?.id !== p.id) e.currentTarget.style.background = 'var(--ink)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{p.icon}</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '4px' }}>{p.title}</div>
          <div style={{ fontSize: '10px', color: demandColor(p.demand), marginBottom: '6px', letterSpacing: '1px' }}>● {p.demand} Demand</div>
          <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.7 }}>{p.avgSalary}</div>
        </button>
      ))}
    </div>
  )

  return (
    <PageLayout
      eyebrow="Career Path Advisor"
      title="Find your path.<br/>Own your future."
      subtitle="Explore career options for BRACU students. Take the quiz to get personalized recommendations."
    >
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
        {([['explore', '🗺️ Explore Paths'], ['quiz', '🎯 Take Quiz'], ['result', '⭐ My Matches']] as const).map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: isMobile ? '10px 6px' : '11px', background: mode === m ? 'var(--red)' : 'var(--ink2)', color: mode === m ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: isMobile ? '9px' : '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {l}
          </button>
        ))}
      </div>

      {/* EXPLORE MODE */}
      {mode === 'explore' && (
        <>
          <CardGrid />
          {selected && (
            <div style={{ marginTop: '2px', background: 'var(--ink2)', border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />

              {/* Header */}
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '36px', flexShrink: 0 }}>{selected.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(24px,4vw,36px)', color: 'var(--paper)', letterSpacing: '2px', lineHeight: 1 }}>{selected.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--faded)', marginTop: '6px', lineHeight: 1.8 }}>{selected.desc}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <div style={{ fontSize: '10px', color: demandColor(selected.demand), letterSpacing: '1px' }}>● {selected.demand} Demand</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: 'var(--red)', letterSpacing: '1px' }}>{selected.avgSalary}</div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)' }}>{selected.timeline}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0' }}>
                {/* Skills + Courses */}
                <div style={{ padding: '20px 24px', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px', fontWeight: 700 }}>SKILLS TO BUILD</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {selected.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid rgba(232,57,14,0.25)', padding: '3px 10px', color: 'rgba(232,57,14,0.7)' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>RELEVANT BRACU COURSES</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {selected.courses.map((c, i) => (
                      <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid var(--border)', padding: '3px 10px', color: 'var(--faded)' }}>{c}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>BD COMPANIES HIRING</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selected.companies.map((c, i) => (
                      <div key={i} style={{ fontSize: '10px', color: 'var(--faded)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--red)', fontSize: '8px' }}>→</span>{c}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roadmap */}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>ROADMAP</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {selected.steps.map((step, i) => (
                      <div key={i} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', gap: '14px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(232,57,14,0.1)', border: '1px solid rgba(232,57,14,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--red)', flexShrink: 0 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)', marginBottom: '3px' }}>{step.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.7, marginBottom: '4px' }}>{step.desc}</div>
                          <div style={{ fontSize: '9px', color: 'var(--red)', letterSpacing: '1px' }}>{step.timeline}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* QUIZ MODE */}
      {mode === 'quiz' && (
        <div style={{ maxWidth: '600px' }}>
          {quizStep < QUESTIONS.length ? (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />

              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--faded)', marginBottom: '8px', letterSpacing: '1px' }}>
                <span>Question {quizStep + 1} of {QUESTIONS.length}</span>
                <span>{Math.round((quizStep / QUESTIONS.length) * 100)}% complete</span>
              </div>
              <div style={{ background: 'rgba(242,237,228,0.06)', height: '3px', marginBottom: '24px' }}>
                <div style={{ height: '100%', background: 'var(--red)', width: `${(quizStep / QUESTIONS.length) * 100}%`, transition: 'width .3s' }} />
              </div>

              <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: 'var(--paper)', marginBottom: '24px', lineHeight: 1.3 }}>
                {QUESTIONS[quizStep].question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {QUESTIONS[quizStep].options.map((opt, i) => (
                  <button key={i}
                    onClick={() => {
                      setQuizAnswers(p => ({ ...p, [QUESTIONS[quizStep].id]: i }))
                      if (quizStep < QUESTIONS.length - 1) setQuizStep(p => p + 1)
                      else { setQuizAnswers(p => ({ ...p, [QUESTIONS[quizStep].id]: i })); setTimeout(getRecommendations, 100) }
                    }}
                    style={{ textAlign: 'left', background: quizAnswers[QUESTIONS[quizStep].id] === i ? 'rgba(232,57,14,0.1)' : 'var(--ink)', border: `1px solid ${quizAnswers[QUESTIONS[quizStep].id] === i ? 'rgba(232,57,14,0.4)' : 'var(--border)'}`, color: quizAnswers[QUESTIONS[quizStep].id] === i ? 'var(--paper)' : 'var(--faded)', padding: '14px 18px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', cursor: 'crosshair', transition: 'all .15s', display: 'flex', gap: '12px', alignItems: 'center', lineHeight: 1.5 }}>
                    <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '16px', color: quizAnswers[QUESTIONS[quizStep].id] === i ? 'var(--red)' : 'var(--dim)', flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                ))}
              </div>

              {quizAnswers[QUESTIONS[quizStep].id] !== undefined && quizStep < QUESTIONS.length - 1 && (
                <button onClick={() => setQuizStep(p => p + 1)}
                  style={{ marginTop: '16px', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                  Next →
                </button>
              )}
              {quizAnswers[QUESTIONS[quizStep].id] !== undefined && quizStep === QUESTIONS.length - 1 && (
                <button onClick={getRecommendations}
                  style={{ marginTop: '16px', background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                  Get My Results →
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--paper)', letterSpacing: '2px' }}>Analyzing your answers...</div>
            </div>
          )}
        </div>
      )}

      {/* RESULTS MODE */}
      {mode === 'result' && (
        <>
          {recommended.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '12px' }}>Take the Quiz First</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '20px' }}>Complete the career quiz to get personalized recommendations based on your interests and strengths.</p>
              <button onClick={() => { setMode('quiz'); setQuizStep(0); setQuizAnswers({}) }}
                style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Take Quiz →
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '16px', fontWeight: 700 }}>
                // YOUR TOP CAREER MATCHES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
                {recommended.map((p, i) => (
                  <div key={p.id}
                    onClick={() => { setSelected(p); setMode('explore') }}
                    style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px', cursor: 'crosshair', display: 'flex', gap: '16px', alignItems: 'center', transition: 'background .15s', borderLeft: `3px solid ${i === 0 ? 'var(--red)' : i === 1 ? 'var(--bronze)' : 'var(--faded)'}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '36px', color: i === 0 ? '#FFD700' : i === 1 ? 'rgba(192,192,192,0.7)' : 'var(--bronze)', width: '40px', flexShrink: 0, lineHeight: 1, textAlign: 'center' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </div>
                    <div style={{ fontSize: '28px', flexShrink: 0 }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)', letterSpacing: '1px' }}>{p.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '3px', lineHeight: 1.7 }}>{p.desc}</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: demandColor(p.demand) }}>● {p.demand} Demand</span>
                        <span style={{ fontSize: '10px', color: 'var(--red)' }}>{p.avgSalary}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--faded)', flexShrink: 0 }}>View Path →</div>
                  </div>
                ))}
              </div>

              <button onClick={() => { setMode('quiz'); setQuizStep(0); setQuizAnswers({}); setRecommended([]) }}
                style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '10px 20px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                Retake Quiz →
              </button>
            </>
          )}
        </>
      )}
    </PageLayout>
  )
}
