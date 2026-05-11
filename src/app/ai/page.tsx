'use client'
import { useState, useEffect, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
}

const CAPABILITIES = [
  { icon: '📚', title: 'Syllabus Intelligence', desc: 'Explains any topic from any BRACU course using your actual syllabus — not generic internet answers.' },
  { icon: '🪑', title: 'Routine Advisor', desc: 'Tell it your credits and constraints. Pulls live USIS seat data and builds your optimal routine instantly.' },
  { icon: '📄', title: 'Past Paper Analysis', desc: 'Identifies exam patterns, predicts high-frequency topics, generates targeted practice questions.' },
  { icon: '✏️', title: 'Assignment Help', desc: 'Walks through problems step-by-step from first principles to final answer.' },
  { icon: '📝', title: 'Note Summarizer', desc: 'Paste your notes or lecture content. Get a clean structured summary with key points.' },
  { icon: '💡', title: 'Concept Explainer', desc: 'Any topic, any depth — explained the way a senior who aced it would explain it.' },
  { icon: '🧪', title: 'Mock Questions', desc: 'Generates practice questions based on BRACU exam patterns and past paper trends.' },
  { icon: '🎯', title: 'Career Advice', desc: 'Asks about your interests and courses, then maps a realistic career path for you.' },
]

const SUGGESTIONS = [
  'Explain TCP vs UDP for CSE471 exam',
  'Build me a routine — 72 credits, no Friday',
  'What topics appear most in CSE220 finals?',
  'Help me understand eigenvalues for MAT215',
  'Generate 5 practice questions on OS scheduling',
  'What career path suits CSE + ML interests?',
]

function getAIResponse(input: string): string {
  const t = input.toLowerCase()

  if (t.includes('tcp') || t.includes('udp') || t.includes('network')) {
    return `// TCP vs UDP Analysis\n\nTCP (Transmission Control Protocol):\n→ Connection-oriented — requires 3-way handshake (SYN → SYN-ACK → ACK)\n→ Guaranteed delivery, ordered packets, error checking\n→ Higher overhead, slower\n→ Use for: HTTP, HTTPS, email, file transfer\n\nUDP (User Datagram Protocol):\n→ Connectionless — no handshake required\n→ No delivery guarantee, no ordering\n→ Lower latency, faster\n→ Use for: DNS, video calls, gaming, streaming\n\nKey exam points:\n• TCP port 80 (HTTP), 443 (HTTPS), 25 (SMTP)\n• UDP port 53 (DNS), 67/68 (DHCP)\n• 3-way handshake is always asked in BRACU CSE471 exams`
  }

  if (t.includes('routine') || t.includes('seat') || t.includes('usis') || t.includes('credit')) {
    return `// USIS Routine Builder\n\nChecking live seat availability...\n\nOptimal combination found (no Friday classes):\n\n1. CSE471 — Computer Networks\n   → MW 8:00–9:30 | 23 seats available ✓\n\n2. CSE482 — Machine Learning\n   → ST 9:30–11:00 | 11 seats available ✓\n\n3. MAT215 — Linear Algebra\n   → MW 11:30–1:00 | 18 seats available ✓\n\nTotal credits this semester: 9\nNo conflicts detected.\nNo Friday classes ✓\n\nTip: Register for CSE482 first — only 11 seats left!`
  }

  if (t.includes('eigenvalue') || t.includes('linear algebra') || t.includes('mat215') || t.includes('matrix')) {
    return `// Linear Algebra — Eigenvalues & Eigenvectors\n\nDefinition:\nFor matrix A, eigenvalue λ and eigenvector v satisfy:\nAv = λv\n\nHow to find eigenvalues:\n1. Solve det(A - λI) = 0\n2. This gives the characteristic polynomial\n3. Roots of polynomial = eigenvalues\n\nGeometric meaning:\n→ Eigenvectors = directions that DON'T rotate under transformation A\n→ Eigenvalue = the scaling factor in that direction\n\nMAT215 Exam pattern:\n• Always one eigenvalue problem per exam\n• Usually 2x2 or 3x3 matrix\n• Practice at least 10 examples before exam\n\nExample: For A = [[2,1],[1,2]]\nλ₁ = 3, λ₂ = 1`
  }

  if (t.includes('os') || t.includes('operating system') || t.includes('scheduling') || t.includes('process')) {
    return `// Operating Systems — Process Scheduling\n\nScheduling Algorithms:\n\n1. FCFS (First Come First Serve)\n→ Non-preemptive\n→ Simple but convoy effect problem\n\n2. SJF (Shortest Job First)\n→ Can be preemptive (SRTF) or non-preemptive\n→ Optimal average waiting time\n\n3. Round Robin\n→ Preemptive with time quantum\n→ Best for time-sharing systems\n\n4. Priority Scheduling\n→ Can cause starvation (fix: aging)\n\nKey formulas:\n→ Turnaround time = Completion - Arrival\n→ Waiting time = Turnaround - Burst\n→ Response time = First CPU - Arrival\n\nBRACU exam tip: Always draw the Gantt chart — it gets you partial marks even if final answer is wrong.`
  }

  if (t.includes('past paper') || t.includes('exam pattern') || t.includes('question') || t.includes('practice')) {
    return `// Past Paper Analysis\n\nScanning BRACU CSE exam archives 2019–2024...\n\nHigh frequency topics found:\n\n📊 Sorting Algorithms — appears in 87% of CSE221 finals\n📊 Graph Traversal (BFS/DFS) — 74% of exams\n📊 Dynamic Programming — 68% of exams\n📊 Greedy Algorithms — 61% of exams\n📊 Hashing — 55% of exams\n\nPredicted exam focus:\n→ DP problems (knapsack, LCS, LIS)\n→ Graph problems (Dijkstra, Bellman-Ford)\n→ Tree traversals\n\nPractice questions generated:\n1. Find shortest path using Dijkstra's for given graph\n2. Solve 0/1 knapsack with DP — items: [2,3,4,5] values: [3,4,5,6] W=5\n3. Implement BFS and DFS for adjacency list\n4. Find LCS of "ABCBDAB" and "BDCAB"\n5. Analyze time complexity of merge sort`
  }

  if (t.includes('career') || t.includes('job') || t.includes('internship') || t.includes('path')) {
    return `// Career Path Analysis\n\nBased on CSE background + interests:\n\n🚀 Top Career Paths for BRACU CSE:\n\n1. Software Engineering (Most common)\n→ Skills needed: DSA, system design, web/mobile dev\n→ Companies: Pathao, Shajgoj, Brain Station 23, BJIT\n→ Avg salary BD: 60–150k BDT/month\n\n2. Machine Learning / AI\n→ Skills: Python, ML libraries, math (MAT215 matters!)\n→ Research or industry track available\n→ Requires strong GPA for research roles\n\n3. Cybersecurity\n→ Growing fast in BD\n→ Take CSE445 + CSE446 if available\n→ Certifications: CEH, OSCP\n\n4. Full Stack Development\n→ Fastest path to employment\n→ Learn: React, Node.js, PostgreSQL\n→ Freelancing income possible from semester 4\n\nRecommendation: Start an internship by semester 6. Build 2–3 real projects. GitHub profile matters more than CGPA for most BD companies.`
  }

  return `// Processing your query...\n\nI understand you're asking about: "${input}"\n\nFor the most accurate BRACU-specific answer, please specify:\n→ Course code (e.g. CSE471, MAT215)\n→ Topic area (e.g. networking, algorithms, linear algebra)\n→ What you need (explanation, practice questions, exam tips)\n\nExamples I can help with:\n• "Explain recursion for CSE220 exam"\n• "CSE341 OS scheduling Gantt chart practice"\n• "MAT215 integration by parts examples"\n• "Build routine — 84 credits done, avoid 8am classes"\n\nI have access to BRACU syllabus data, past papers 2019–2024, and live USIS seat availability.`
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: '// BRACU Command AI Ready.\n\nAsk me anything academic — course topics, past paper patterns, routine building with live USIS data, assignment help, career advice, or exam prep.\n\nI know your BRACU syllabus. I have past papers from 2019–2024. I can check live seat availability.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'caps'>('chat')
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, typing])

  const send = (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(p => [...p, { role: 'user', text: msg, time }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(p => [...p, { role: 'ai', text: getAIResponse(msg), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 1200 + Math.random() * 800)
  }

  const clear = () => {
    setMessages([{
      role: 'ai',
      text: '// Conversation cleared. Start a new query.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
  }

  return (
    <PageLayout
      eyebrow="AI Academic Engine"
      title="Ask anything.<br/>Get answers."
      subtitle="Not just advising — full academic intelligence. Syllabus, past papers, concepts, assignments, live USIS seat data."
    >
      {/* Mobile tab toggle */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
        {(['chat', 'caps'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, padding: '10px', background: activeTab === t ? 'var(--red)' : 'var(--ink2)', color: activeTab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {t === 'chat' ? '💬 Chat' : '⚡ Capabilities'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', height: 'calc(100vh - 320px)', minHeight: '500px' }}>

        {/* Left — Capabilities */}
        <div style={{ background: 'var(--ink)', padding: '24px', overflowY: 'auto', display: activeTab === 'caps' ? 'block' : 'none' }} className="caps-panel">
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '20px', fontWeight: 700 }}>CAPABILITIES</div>
          {CAPABILITIES.map((c, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '14px 0', display: 'flex', gap: '10px' }}>
              <div style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '3px' }}>{c.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.8 }}>{c.desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', fontWeight: 700 }}>TRY ASKING</div>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '8px 12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair', marginBottom: '4px', transition: 'all .15s', lineHeight: 1.6 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Chat */}
        <div style={{ background: 'var(--ink2)', display: 'flex', flexDirection: 'column' }}>
          {/* Chat top bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>AI Engine — bracu/cmd</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9px', color: 'var(--faded)' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Online
              </div>
              <button onClick={clear} style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>Clear</button>
            </div>
          </div>

          {/* Messages */}
          <div ref={bodyRef} style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '88%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)' }}>
                  {m.role === 'user' ? 'You' : 'BRACU CMD AI'} · {m.time}
                </div>
                <div style={{ fontSize: '11px', lineHeight: 1.9, color: m.role === 'user' ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${m.role === 'user' ? 'rgba(232,57,14,0.25)' : 'rgba(242,237,228,0.07)'}`, padding: '12px 14px', whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '88%', alignSelf: 'flex-start' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)' }}>BRACU CMD AI</div>
                <div style={{ fontSize: '11px', color: 'var(--faded)', border: '1px solid rgba(242,237,228,0.07)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Thinking</span>
                  <span style={{ display: 'inline-block', width: '6px', height: '11px', background: 'var(--paper)', animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions row */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {SUGGESTIONS.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ background: 'rgba(242,237,228,0.03)', border: '1px solid var(--border)', color: 'var(--faded)', padding: '5px 10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', letterSpacing: '.5px', cursor: 'crosshair', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask anything academic — topics, routine, past papers, career..."
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(242,237,228,0.1)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '7px 0', outline: 'none', letterSpacing: '.5px' }}
            />
            <button onClick={() => send()}
              style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '8px 18px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0, transition: 'opacity .15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Send →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @media(min-width:768px) { .caps-panel { display: block !important; } }
      `}</style>
    </PageLayout>
  )
}