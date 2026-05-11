'use client'
import { useState, useEffect, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Question {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  hint: string
  sampleAnswer: string
}

interface Session {
  questionId: string
  answer: string
  feedback: string
  score: number
  time: number
}

const QUESTION_BANK: Question[] = [
  // Behavioral
  { id: 'b1', category: 'Behavioral', difficulty: 'easy', question: 'Tell me about yourself.', hint: 'Structure: Present → Past → Future. Keep it under 2 minutes.', sampleAnswer: 'I\'m a CSE student at BRACU University in my 7th semester. I have a strong foundation in data structures and algorithms, and I\'ve been working with Python and React for the past year. I built a student platform called BRACU Command that\'s used by 1000+ students. I\'m looking to join a team where I can contribute to real products and grow as a software engineer.' },
  { id: 'b2', category: 'Behavioral', difficulty: 'easy', question: 'Why do you want to work here?', hint: 'Research the company first. Show genuine interest in their products/culture.', sampleAnswer: 'I\'ve been using your product for over a year and I appreciate how it solves [specific problem]. I\'m excited about the technical challenges your team works on, especially [specific feature]. I want to contribute to products that users genuinely love, and based on my research, this team does exactly that.' },
  { id: 'b3', category: 'Behavioral', difficulty: 'medium', question: 'Tell me about a time you failed and what you learned from it.', hint: 'Use STAR method. Be honest. Focus on the lesson learned, not the failure.', sampleAnswer: 'In my 4th semester, I joined a hackathon with high confidence but our team\'s project failed because we didn\'t scope it properly. We tried to build too much in 24 hours. I learned to break projects into MVP and stretch goals, and now I always define minimum success criteria before starting. In the next hackathon, we won 2nd place.' },
  { id: 'b4', category: 'Behavioral', difficulty: 'medium', question: 'Describe a situation where you had to work with a difficult team member.', hint: 'Focus on the process and resolution, not the other person\'s flaws.', sampleAnswer: 'During a group project, one team member consistently missed deadlines. Instead of escalating immediately, I had a direct conversation and discovered they were struggling with the technical parts. We redistributed tasks based on strengths — they handled research and presentation while I covered more coding. The project was submitted on time and received an A.' },
  { id: 'b5', category: 'Behavioral', difficulty: 'hard', question: 'Where do you see yourself in 5 years?', hint: 'Be specific but realistic. Show ambition while connecting it to this company.', sampleAnswer: 'In 5 years, I see myself as a senior software engineer who can architect systems end-to-end. I want to have shipped features used by millions of users. Starting in this role, I\'d focus on learning the codebase deeply, then take ownership of features, and eventually mentor juniors. I\'m particularly interested in growing my expertise in distributed systems.' },
  // Technical
  { id: 't1', category: 'Technical', difficulty: 'easy', question: 'What is the difference between an array and a linked list?', hint: 'Think about memory layout, access time, insertion/deletion.', sampleAnswer: 'Arrays store elements in contiguous memory, so random access is O(1) but insertion/deletion in the middle is O(n) due to shifting. Linked lists store elements with pointers, so insertion/deletion is O(1) if you have the node, but random access is O(n). Arrays have better cache performance. Use arrays for frequent random access, linked lists for frequent insertions/deletions.' },
  { id: 't2', category: 'Technical', difficulty: 'medium', question: 'Explain how HashMap works internally in Java/Python.', hint: 'Think about hash function, buckets, collision handling, load factor.', sampleAnswer: 'A HashMap stores key-value pairs in an array of buckets. When you put a key, it calculates hash(key) % arraySize to find the bucket index. Collisions (when two keys map to same bucket) are handled by chaining (each bucket is a linked list) or open addressing. In Python, dict uses open addressing with pseudo-random probing. When the load factor exceeds 0.75, the table is resized to maintain O(1) amortized operations.' },
  { id: 't3', category: 'Technical', difficulty: 'medium', question: 'What is the difference between SQL and NoSQL databases?', hint: 'Think about structure, scalability, ACID properties, use cases.', sampleAnswer: 'SQL databases are relational, use structured schemas, and support ACID transactions. They\'re great for complex queries and relationships. NoSQL databases (MongoDB, Redis, Cassandra) are schema-flexible and horizontally scalable. MongoDB stores JSON-like documents, Redis is an in-memory key-value store, Cassandra handles massive write loads. Use SQL for financial systems, NoSQL for user data that scales rapidly.' },
  { id: 't4', category: 'Technical', difficulty: 'hard', question: 'Design a URL shortener like bit.ly.', hint: 'Think about: hash generation, database, API endpoints, scalability.', sampleAnswer: 'I\'d design it with: 1) API endpoints: POST /shorten to create, GET /{code} to redirect. 2) Hash generation: take the long URL, generate a 6-character base62 string (62^6 = 56B combinations). 3) Database: store {code, long_url, created_at, click_count}. 4) For scale: use Redis cache for hot URLs, database for persistence, CDN for global distribution. 5) Collision handling: check DB before saving, retry with different hash if collision.' },
  { id: 't5', category: 'Technical', difficulty: 'easy', question: 'What is Big O notation and why does it matter?', hint: 'Explain the concept then give practical examples.', sampleAnswer: 'Big O notation describes how an algorithm\'s time or space requirements grow as input size increases. It lets us compare algorithms independent of hardware. O(1) is constant time (array access), O(log n) is logarithmic (binary search), O(n) is linear (linear search), O(n²) is quadratic (nested loops). It matters because an O(n²) algorithm on 1 million items takes 1 trillion operations while O(n log n) takes only 20 million.' },
  // HR
  { id: 'h1', category: 'HR', difficulty: 'easy', question: 'What is your expected salary?', hint: 'Research market rates first. Give a range, not a single number.', sampleAnswer: 'Based on my research on market rates for entry-level software engineers in Dhaka, and considering my skills in [relevant skills], I\'m looking for a range of 50,000–70,000 BDT per month. However, I\'m flexible and the total compensation package including learning opportunities matters to me as much as the base salary.' },
  { id: 'h2', category: 'HR', difficulty: 'easy', question: 'What are your greatest strengths?', hint: 'Pick 2-3 strengths relevant to the role. Back each with a specific example.', sampleAnswer: 'My biggest strength is problem-solving under pressure. During exam weeks, I still find time to debug production issues on my side projects. I\'m also a fast learner — I taught myself React in 3 weeks when a project required it. And I communicate technical concepts well, which helps me work across teams.' },
  { id: 'h3', category: 'HR', difficulty: 'medium', question: 'What is your greatest weakness?', hint: 'Be honest but strategic. Mention a real weakness and what you\'re doing about it.', sampleAnswer: 'I sometimes spend too long trying to perfect code before shipping. I\'ve learned to set time-boxes for tasks and ship at "good enough" then iterate. I now use the 80/20 rule — 80% of value comes from 20% of effort. It\'s still something I actively work on, but I\'ve gotten much better at shipping v1 then improving.' },
]

const CATEGORIES = ['All', 'Behavioral', 'Technical', 'HR']
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard']

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#5fd49a',
  medium: 'var(--bronze)',
  hard: 'var(--red)',
}

function getFeedback(answer: string, question: Question): { feedback: string; score: number } {
  const words = answer.trim().split(' ').filter(Boolean).length

  if (words < 10) return { feedback: '// Answer too short.\n\nTry to give a more detailed response. Use the STAR method (Situation, Task, Action, Result) for behavioral questions. Aim for at least 3-4 sentences.', score: 2 }

  if (words < 30) return { feedback: `// Good start, but needs more depth.\n\nYour answer covers the basics but could be stronger. Try to:\n→ Add a specific example from your experience\n→ Quantify results where possible (numbers, percentages)\n→ Connect your answer to the role you're applying for\n\nScore: 5/10 — keep practicing!`, score: 5 }

  const hasNumbers = /\d/.test(answer)
  const hasSpecific = answer.toLowerCase().includes('when') || answer.toLowerCase().includes('built') || answer.toLowerCase().includes('led') || answer.toLowerCase().includes('achieved')

  if (hasNumbers && hasSpecific) {
    return { feedback: `// Excellent answer!\n\nStrengths:\n→ Good length and detail\n→ Includes specific examples ✓\n→ Uses numbers/metrics ✓\n→ Structured response\n\nSample strong answer for comparison:\n\n"${question.sampleAnswer.substring(0, 200)}..."\n\nScore: 9/10 — interview-ready!`, score: 9 }
  }

  if (hasSpecific) {
    return { feedback: `// Good answer!\n\nStrengths:\n→ Good length\n→ Includes specific examples ✓\n\nTo improve:\n→ Add numbers/metrics to quantify impact\n→ Example: Instead of "improved performance" say "improved load time by 40%"\n\nScore: 7/10 — solid, but add metrics!`, score: 7 }
  }

  return { feedback: `// Decent answer, room to improve.\n\nYour answer is generic. To make it stronger:\n→ Add a specific situation from your life\n→ Use STAR method: Situation, Task, Action, Result\n→ Include measurable outcomes\n\nTip: Think of a real example before answering. Specificity wins interviews.\n\nScore: 6/10`, score: 6 }
}

export default function InterviewPage() {
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [currentQ, setCurrentQ] = useState<Question>(QUESTION_BANK[0])
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSample, setShowSample] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [mode, setMode] = useState<'practice' | 'mock'>('practice')
  const [mockIndex, setMockIndex] = useState(0)
  const [mockDone, setMockDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const filtered = QUESTION_BANK.filter(q =>
    (category === 'All' || q.category === category) &&
    (difficulty === 'All' || q.difficulty === difficulty)
  )

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(p => p + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive])

  const startAnswer = () => {
    setTimer(0)
    setTimerActive(true)
    setShowFeedback(false)
    setShowHint(false)
    setShowSample(false)
    setAnswer('')
    setFeedback('')
  }

  const submitAnswer = () => {
    setTimerActive(false)
    const result = getFeedback(answer, currentQ)
    setFeedback(result.feedback)
    setScore(result.score)
    setShowFeedback(true)
    setSessions(p => [...p, { questionId: currentQ.id, answer, feedback: result.feedback, score: result.score, time: timer }])
  }

  const nextQuestion = () => {
    if (mode === 'mock') {
      if (mockIndex < filtered.length - 1) {
        setMockIndex(p => p + 1)
        setCurrentQ(filtered[mockIndex + 1])
      } else {
        setMockDone(true)
        return
      }
    } else {
      const remaining = filtered.filter(q => q.id !== currentQ.id)
      if (remaining.length > 0) {
        setCurrentQ(remaining[Math.floor(Math.random() * remaining.length)])
      }
    }
    startAnswer()
  }

  const avgScore = sessions.length > 0 ? (sessions.reduce((a, s) => a + s.score, 0) / sessions.length).toFixed(1) : 0
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <PageLayout
      eyebrow="AI Interview Prep"
      title="Practice until<br/>you're interview-ready."
      subtitle="Real interview questions with AI feedback. Behavioral, technical, and HR — all in one place."
    >
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
        {([['practice', '🎯 Practice Mode'], ['mock', '⏱️ Mock Interview']] as const).map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setMockIndex(0); setMockDone(false) }}
            style={{ flex: 1, padding: '11px', background: mode === m ? 'var(--red)' : 'var(--ink2)', color: mode === m ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', minHeight: '600px' }}>

        {/* Left — Question selector */}
        <div style={{ background: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding: '4px 10px', background: category === c ? 'var(--red)' : 'transparent', color: category === c ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${category === c ? 'var(--red)' : 'var(--border)'}`, fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{ padding: '3px 8px', background: difficulty === d ? (DIFFICULTY_COLOR[d] || 'var(--red)') : 'transparent', color: difficulty === d ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${difficulty === d ? (DIFFICULTY_COLOR[d] || 'var(--red)') : 'var(--border)'}`, fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                  {d === 'All' ? 'All' : d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(q => (
              <div key={q.id}
                onClick={() => { setCurrentQ(q); startAnswer() }}
                style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'crosshair', background: currentQ.id === q.id ? 'var(--ink2)' : 'transparent', borderLeft: currentQ.id === q.id ? '2px solid var(--red)' : '2px solid transparent', transition: 'all .15s' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '7px', letterSpacing: '1px', textTransform: 'uppercase', color: DIFFICULTY_COLOR[q.difficulty], border: `1px solid ${DIFFICULTY_COLOR[q.difficulty]}`, padding: '1px 5px', opacity: .8 }}>{q.difficulty}</span>
                  <span style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px' }}>{q.category}</span>
                  {sessions.find(s => s.questionId === q.id) && (
                    <span style={{ fontSize: '8px', color: '#5fd49a', marginLeft: 'auto' }}>✓ {sessions.find(s => s.questionId === q.id)?.score}/10</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.4 }}>{q.question}</div>
              </div>
            ))}
          </div>

          {/* Session stats */}
          {sessions.length > 0 && (
            <div style={{ padding: '14px', borderTop: '1px solid var(--border)', background: 'var(--ink2)' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>SESSION</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[{ label: 'Answered', val: sessions.length }, { label: 'Avg Score', val: `${avgScore}/10` }].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
                    <div style={{ fontSize: '8px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Question + Answer */}
        <div style={{ background: 'var(--ink2)', display: 'flex', flexDirection: 'column' }}>

          {mockDone ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '8px' }}>Mock Interview Complete!</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '48px', color: Number(avgScore) >= 7 ? '#5fd49a' : 'var(--red)', letterSpacing: '2px', marginBottom: '8px' }}>{avgScore}/10</div>
              <div style={{ fontSize: '11px', color: 'var(--faded)', marginBottom: '24px' }}>Average score across {sessions.length} questions</div>
              <button onClick={() => { setMockDone(false); setMockIndex(0); setSessions([]) }}
                style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Try Again →
              </button>
            </div>
          ) : (
            <>
              {/* Question header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: DIFFICULTY_COLOR[currentQ.difficulty], border: `1px solid ${DIFFICULTY_COLOR[currentQ.difficulty]}`, padding: '2px 8px', flexShrink: 0 }}>{currentQ.difficulty}</span>
                <span style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>{currentQ.category}</span>
                {timerActive && (
                  <div style={{ marginLeft: 'auto', fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: timer > 120 ? 'var(--red)' : 'var(--bronze)', letterSpacing: '2px' }}>
                    {formatTime(timer)}
                  </div>
                )}
              </div>

              {/* Question */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: '20px', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {currentQ.question}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowHint(!showHint)}
                    style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--bronze)', background: 'none', border: '1px solid rgba(139,115,85,0.3)', padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                    {showHint ? 'Hide Hint' : '💡 Show Hint'}
                  </button>
                  {showFeedback && (
                    <button onClick={() => setShowSample(!showSample)}
                      style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5fd49a', background: 'none', border: '1px solid rgba(95,212,154,0.3)', padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                      {showSample ? 'Hide Sample' : '📝 Sample Answer'}
                    </button>
                  )}
                </div>
                {showHint && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(139,115,85,0.08)', border: '1px solid rgba(139,115,85,0.2)', fontSize: '11px', color: 'var(--bronze)', lineHeight: 1.8 }}>
                    💡 {currentQ.hint}
                  </div>
                )}
                {showSample && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(95,212,154,0.06)', border: '1px solid rgba(95,212,154,0.2)', fontSize: '11px', color: '#5fd49a', lineHeight: 1.9 }}>
                    📝 {currentQ.sampleAnswer}
                  </div>
                )}
              </div>

              {/* Answer area */}
              <div style={{ flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!timerActive && !showFeedback && (
                  <button onClick={startAnswer}
                    style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '13px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair', width: '100%' }}>
                    Start Answering →
                  </button>
                )}

                {timerActive && (
                  <>
                    <textarea
                      autoFocus
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your answer here. Speak naturally — like you would in a real interview..."
                      rows={8}
                      style={{ background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '14px', outline: 'none', resize: 'none', lineHeight: 1.8, flex: 1 }}
                    />
                    <button onClick={submitAnswer} disabled={answer.length < 5}
                      style={{ background: answer.length >= 5 ? 'var(--paper)' : 'var(--dim)', color: 'var(--ink)', border: 'none', padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: answer.length >= 5 ? 'crosshair' : 'not-allowed' }}>
                      Submit Answer →
                    </button>
                  </>
                )}

                {showFeedback && (
                  <>
                    <div style={{ background: 'var(--ink)', border: `1px solid ${score >= 7 ? 'rgba(95,212,154,0.3)' : score >= 5 ? 'rgba(139,115,85,0.3)' : 'rgba(232,57,14,0.3)'}`, padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', fontWeight: 700 }}>AI FEEDBACK</div>
                        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: score >= 7 ? '#5fd49a' : score >= 5 ? 'var(--bronze)' : 'var(--red)', letterSpacing: '2px' }}>{score}/10</div>
                      </div>
                      <pre style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace', wordBreak: 'break-word' }}>{feedback}</pre>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--dim)', fontStyle: 'italic', paddingLeft: '4px' }}>Your answer: "{answer.substring(0, 100)}{answer.length > 100 ? '...' : ''}"</div>
                    <button onClick={nextQuestion}
                      style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                      Next Question →
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tips */}
      <div style={{ marginTop: '24px', background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>INTERVIEW TIPS FOR BRACU STUDENTS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
          {[
            { icon: '🌟', tip: 'Research the company deeply before the interview. Know their products, tech stack, and recent news.' },
            { icon: '📊', tip: 'Quantify everything. "Improved performance" is weak. "Reduced load time by 40%" is strong.' },
            { icon: '🎯', tip: 'Use STAR method for behavioral questions: Situation, Task, Action, Result.' },
            { icon: '💻', tip: 'For technical rounds, think aloud. Interviewers want to see how you think, not just the answer.' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--ink)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{t.icon}</span>
              <div style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.7 }}>{t.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}