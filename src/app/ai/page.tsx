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

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    text: '// BRACU Command AI Ready.\n\nAsk me anything academic — course topics, past paper patterns, routine building, assignment help, career advice, or exam prep.\n\nI know your BRACU syllabus. Past papers 2019–2024. Live USIS data.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'caps'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(p => [...p, { role: 'user', text: msg, time }])
    setInput('')
    setTyping(true)
    setActiveTab('chat')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setTyping(false)
      setMessages(p => [...p, {
        role: 'ai',
        text: data.response || 'Sorry, could not process that.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setTyping(false)
      setMessages(p => [...p, {
        role: 'ai',
        text: 'Connection error. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    }
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
        .ai-root {
          display: flex;
          gap: 2px;
          background: var(--border);
          border: 1px solid var(--border);
          height: calc(100vh - 320px);
          min-height: 500px;
          overflow: hidden;
        }
        .ai-tabs { display: none; margin-bottom: 8px; }
        .ai-caps {
          width: 260px;
          flex-shrink: 0;
          background: var(--ink);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ai-caps-inner {
          overflow-y: auto;
          flex: 1;
          padding: 16px;
        }
        .ai-chat {
          flex: 1;
          background: var(--ink2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ai-bottom {
          flex-shrink: 0;
          border-top: 1px solid var(--border);
          background: var(--ink2);
        }
        @media (max-width: 767px) {
          .ai-tabs { display: flex !important; gap: 2px; }
          .ai-root { height: calc(100vh - 280px); min-height: 400px; }
          .ai-caps { display: none; width: 100% !important; }
          .ai-caps.show { display: flex !important; }
          .ai-chat { display: none; }
          .ai-chat.show { display: flex !important; }
        }
      `}</style>

      {/* Mobile tabs */}
      <div className="ai-tabs">
        {(['chat', 'caps'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ flex: 1, padding: '10px', background: activeTab === t ? 'var(--red)' : 'var(--ink2)', color: activeTab === t ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {t === 'chat' ? '💬 Chat' : '⚡ Capabilities'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="ai-root">

        {/* Capabilities panel */}
        <div className={`ai-caps${activeTab === 'caps' ? ' show' : ''}`}>
          <div className="ai-caps-inner">
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>CAPABILITIES</div>
            {CAPABILITIES.map((c, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0', display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--paper)', marginBottom: '2px' }}>{c.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '10px', fontWeight: 700 }}>TRY ASKING</div>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => { send(s); setActiveTab('chat') }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '7px 10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', cursor: 'crosshair', marginBottom: '4px', lineHeight: 1.5, transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className={`ai-chat${activeTab === 'chat' ? ' show' : ''}`}>

          {/* Chat header */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
              <span style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)' }}>AI Engine — bracu/cmd</span>
            </div>
            <button onClick={clear}
              style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '3px 10px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
              Clear
            </button>
          </div>

          {/* Messages — scrollable */}
          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)' }}>
                  {m.role === 'user' ? 'You' : 'BRACU CMD AI'} · {m.time}
                </div>
                <div style={{ fontSize: '11px', lineHeight: 1.9, color: m.role === 'user' ? 'var(--paper)' : 'var(--faded)', background: m.role === 'user' ? 'rgba(232,57,14,0.08)' : 'rgba(242,237,228,0.03)', border: `1px solid ${m.role === 'user' ? 'rgba(232,57,14,0.2)' : 'rgba(242,237,228,0.07)'}`, padding: '10px 14px', whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace', wordBreak: 'break-word' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--faded)' }}>BRACU CMD AI</div>
                <div style={{ fontSize: '11px', color: 'var(--faded)', border: '1px solid rgba(242,237,228,0.07)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'IBM Plex Mono,monospace' }}>
                  Thinking <span style={{ display: 'inline-block', width: '6px', height: '11px', background: 'var(--paper)', animation: 'blink 1s step-end infinite' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom — fixed at bottom */}
          <div className="ai-bottom">
            {/* Suggestion chips */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  style={{ background: 'rgba(242,237,228,0.03)', border: '1px solid var(--border)', color: 'var(--faded)', padding: '4px 10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', cursor: 'crosshair', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--paper)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--faded)' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div style={{ padding: '12px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask anything academic..."
                style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(242,237,228,0.12)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '14px', padding: '8px 0', outline: 'none', minWidth: 0, cursor: 'text' }}
              />
              <button onClick={() => send()}
                style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '10px 18px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair', flexShrink: 0 }}>
                Send →
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  )
}