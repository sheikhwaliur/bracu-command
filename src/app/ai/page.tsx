'use client'
import { useState, useEffect, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Message {
  role: 'user' | 'ai'
  text: string
  time: string
}

const CAPABILITIES = [
  { icon: '📚', title: 'Syllabus Intelligence', desc: 'Explains any BRACU course topic using your actual syllabus.' },
  { icon: '🪑', title: 'Routine Advisor', desc: 'Builds your optimal routine with live USIS seat data.' },
  { icon: '📄', title: 'Past Paper Analysis', desc: 'Identifies exam patterns and high-frequency topics.' },
  { icon: '✏️', title: 'Assignment Help', desc: 'Walks through problems step-by-step.' },
  { icon: '📝', title: 'Note Summarizer', desc: 'Paste notes, get a clean structured summary.' },
  { icon: '💡', title: 'Concept Explainer', desc: 'Any topic explained simply and deeply.' },
  { icon: '🧪', title: 'Mock Questions', desc: 'Practice questions based on BRACU exam patterns.' },
  { icon: '🎯', title: 'Career Advice', desc: 'Maps a career path based on your courses and interests.' },
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
    return `// TCP vs UDP Analysis\n\nTCP:\n→ Connection-oriented (3-way handshake)\n→ Guaranteed delivery, ordered packets\n→ Use for: HTTP, HTTPS, email\n\nUDP:\n→ Connectionless, no handshake\n→ No delivery guarantee, faster\n→ Use for: DNS, video calls, gaming\n\nBRACU exam tip: 3-way handshake is always asked in CSE471.`
  }
  if (t.includes('routine') || t.includes('usis') || t.includes('credit') || t.includes('seat')) {
    return `// USIS Routine Builder\n\nOptimal combination (no Friday):\n\n1. CSE471 — MW 8:00–9:30 | 23 seats ✓\n2. CSE482 — ST 9:30–11:00 | 11 seats ✓\n3. MAT215 — MW 11:30–1:00 | 18 seats ✓\n\nTotal: 9 credits | No conflicts ✓\nTip: Register CSE482 first — only 11 seats!`
  }
  if (t.includes('eigenvalue') || t.includes('mat215') || t.includes('matrix')) {
    return `// Linear Algebra — Eigenvalues\n\nDefinition: Av = λv\nv = eigenvector (unchanged direction)\nλ = eigenvalue (scaling factor)\n\nHow to find:\n1. Solve det(A - λI) = 0\n2. Roots = eigenvalues\n\nMAT215 exam: Always 1 eigenvalue problem.\nPractice at least 10 before exam.`
  }
  if (t.includes('os') || t.includes('scheduling') || t.includes('process')) {
    return `// OS — Process Scheduling\n\n1. FCFS — Non-preemptive, simple\n2. SJF — Shortest job first, optimal avg wait\n3. Round Robin — Preemptive, time quantum\n4. Priority — Can cause starvation\n\nFormulas:\n→ Turnaround = Completion - Arrival\n→ Waiting = Turnaround - Burst\n\nExam tip: Draw Gantt chart for partial marks!`
  }
  if (t.includes('career') || t.includes('job') || t.includes('internship')) {
    return `// Career Path for BRACU CSE\n\n1. Software Engineering\n→ Skills: DSA, React, Node.js\n→ Companies: Brain Station 23, BJIT, Pathao\n\n2. Machine Learning\n→ Skills: Python, MAT215, PyTorch\n→ Needs strong GPA for research\n\n3. Full Stack Dev\n→ Fastest path to income\n→ Freelance from semester 4\n\nTip: GitHub > CGPA for most BD companies.`
  }
  return `// Processing: "${input}"\n\nFor accurate BRACU-specific answers:\n→ Include course code (e.g. CSE471)\n→ Specify topic area\n→ Tell me what you need\n\nExamples:\n• "Explain recursion for CSE220"\n• "OS scheduling Gantt chart practice"\n• "Build routine — 84 credits, avoid 8am"`
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    text: '// BRACU Command AI Ready.\n\nAsk me anything academic — course topics, past paper patterns, routine building, assignment help, career advice, or exam prep.\n\nI know your BRACU syllabus. Past papers 2019–2024. Live USIS data.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }])
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
    setActiveTab('chat')
    setTimeout(() => {
      setTyping(false)
      setMessages(p => [...p, { role: 'ai', text: getAIResponse(msg), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 1200 + Math.random() * 600)
  }

  const clear = () => setMessages([{
    role: 'ai',
    text: '// Conversation cleared.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }])

  return (
    <PageLayout
      eyebrow="AI Academic Engine"
      title="Ask anything.<br/>Get answers."
      subtitle="Full academic intelligence — syllabus, past papers, concepts, assignments, live USIS seat data."
    >
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .ai-tabs { display: none; }
        .ai-caps { display: block; }
        .ai-chat { display: flex; }

        @media (max-width: 767px) {
          .ai-tabs { display: flex !important; }
          .ai-layout { flex-direction: column !important; }
          .ai-caps { display: none; }
          .ai-chat { display: none; }
          .ai-caps.active { display: block !important; }
          .ai-chat.active { display: flex !important; }
          .ai-chat-inner { height: 60vh !important; min-height: 400px !important; }
        }
      `}</style>

      {/* Mobile tabs */}
      <div className="ai-tabs" style={{ gap: '2px', marginBottom: '12px' }}>
        {(['chat', 'caps'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, padding: '11px', background: activeTab === t ? 'var(--red)' : 'var(--ink2)', color: activeTab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {t === 'chat' ? '💬 Chat' : '⚡ Capabilities'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="ai-layout" style={{ display: 'flex', gap: '2px', border: '1px solid var(--border)', background: 'var(--border)' }}>

        {/* Capabilities panel */}
        <div className={`ai-caps${activeTab === 'caps' ? ' active' : ''}`}
          style={{ width: '280px', flexShrink: 0, background: 'var(--ink)', padding: '20px', overflowY: 'auto', maxHeight: '640px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>CAPABILITIES</div>
          {CAPABILITIES.map((c, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', gap: '10px' }}>
              <div style={{ fontSize: '16px', flexShrink: 0 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '3px' }}>{c.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.7 }}>{c.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>TRY ASKING</div>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '8px 10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair', marginBottom: '4px', transition: 'all .15s', lineHeight: 1.5 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`ai-chat${activeTab === 'chat' ? ' active' : ''}`}
          style={{ flex: 1, background: 'var(--ink2)', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>AI Engine — bracu/cmd</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9px', color: 'var(--faded)' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />Online
              </span>
              <button onClick={clear} style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>Clear</button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chat-inner" ref={bodyRef}
            style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', height: '420px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '90%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)' }}>
                  {m.role === 'user' ? 'You' : 'BRACU CMD AI'} · {m.time}
                </div>
                <div style={{ fontSize: '11px', lineHeight: 1.9, color: m.role === 'user' ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${m.role === 'user' ? 'rgba(232,57,14,0.25)' : 'rgba(242,237,228,0.07)'}`, padding: '12px 14px', whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace', wordBreak: 'break-word' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)' }}>BRACU CMD AI</div>
                <div style={{ fontSize: '11px', color: 'var(--faded)', border: '1px solid rgba(242,237,228,0.07)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Thinking <span style={{ display: 'inline-block', width: '6px', height: '11px', background: 'var(--paper)', animation: 'blink 1s step-end infinite' }} />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ background: 'rgba(242,237,228,0.03)', border: '1px solid var(--border)', color: 'var(--faded)', padding: '5px 10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', cursor: 'crosshair', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask anything academic..."
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(242,237,228,0.1)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '7px 0', outline: 'none', letterSpacing: '.5px', minWidth: 0 }}
            />
            <button onClick={() => send()}
              style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '9px 16px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0 }}>
              Send →
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
