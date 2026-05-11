'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Answer {
  id: string
  text: string
  upvotes: number
  time: string
  upvoted?: boolean
  accepted?: boolean
}

interface Question {
  id: string
  title: string
  body: string
  course: string
  tags: string[]
  answers: Answer[]
  views: number
  time: string
  solved: boolean
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: '1', course: 'CSE220', solved: true, views: 234,
    title: 'How do you implement a binary search tree deletion with all 3 cases?',
    body: 'I understand insertion and search but deletion with 3 cases (leaf, one child, two children) is confusing me. Can someone explain with code?',
    tags: ['BST', 'Trees', 'Deletion'],
    time: '3 days ago',
    answers: [
      { id: 'a1', upvotes: 34, upvoted: false, accepted: true, time: '3 days ago', text: 'BST deletion has 3 cases:\n\n1. Node is a leaf → just delete it\n2. Node has 1 child → replace node with its child\n3. Node has 2 children → find inorder successor (smallest in right subtree), copy its value to current node, delete the successor\n\nFor case 3, the inorder successor always has at most 1 child (right child), so it reduces to case 1 or 2.\n\nCode:\nif node is leaf: return null\nif one child: return that child\nif two children:\n  successor = findMin(node.right)\n  node.val = successor.val\n  node.right = delete(node.right, successor.val)' },
      { id: 'a2', upvotes: 12, upvoted: false, accepted: false, time: '2 days ago', text: 'For the exam, Sir usually asks to trace through deletion on a drawn tree. Practice drawing the before and after states, especially for case 3. Past papers 2021-2023 all had this.' }
    ]
  },
  {
    id: '2', course: 'MAT215', solved: false, views: 187,
    title: 'What is the intuition behind eigenvalues — not just the formula?',
    body: 'I can solve eigenvalue problems but I don\'t understand what they actually represent geometrically. Can anyone explain the real concept?',
    tags: ['Eigenvalues', 'Linear Algebra', 'Intuition'],
    time: '1 day ago',
    answers: [
      { id: 'a3', upvotes: 28, upvoted: false, accepted: false, time: '1 day ago', text: 'Think of a matrix as a transformation — it rotates and stretches space.\n\nMost vectors change direction when multiplied by a matrix. But some special vectors only get stretched or shrunk — they don\'t change direction. These are eigenvectors.\n\nThe eigenvalue is HOW MUCH it gets stretched. λ=2 means doubled. λ=−1 means flipped. λ=0 means collapsed to zero.\n\nPractical example: In Google\'s PageRank algorithm, the most important webpage is the eigenvector of the link matrix. In ML, PCA uses eigenvectors to find the directions of maximum variance.' }
    ]
  },
  {
    id: '3', course: 'CSE341', solved: true, views: 312,
    title: 'Difference between process and thread in OS — exam level answer?',
    body: 'I know the basic difference but in exams they ask for more detail. What are the key points to include?',
    tags: ['Process', 'Thread', 'OS'],
    time: '5 days ago',
    answers: [
      { id: 'a4', upvotes: 45, upvoted: false, accepted: true, time: '5 days ago', text: 'PROCESS vs THREAD — exam answer:\n\nProcess:\n→ Independent program in execution\n→ Has its own memory space (code, data, heap, stack)\n→ Communication via IPC (pipes, sockets, shared memory)\n→ Context switch is expensive\n→ If one crashes, others are unaffected\n\nThread:\n→ Lightweight unit of a process\n→ Shares memory with other threads in same process\n→ Communication via shared memory (faster)\n→ Context switch is cheaper\n→ If one crashes, whole process can crash\n\nKey table to memorize:\nFeature | Process | Thread\nMemory | Separate | Shared\nCreation | Slow | Fast\nComm | IPC | Shared mem\nCrash | Isolated | Can kill all' }
    ]
  },
  {
    id: '4', course: 'CSE471', solved: false, views: 143,
    title: 'How does TCP\'s 3-way handshake work step by step?',
    body: 'The textbook explanation is confusing. Can someone explain it simply with what each party does at each step?',
    tags: ['TCP', 'Networking', '3-way handshake'],
    time: '2 days ago',
    answers: [
      { id: 'a5', upvotes: 19, upvoted: false, accepted: false, time: '2 days ago', text: 'TCP 3-way handshake simplified:\n\nStep 1 — SYN (Client → Server)\nClient says "I want to connect, my sequence number is X"\nClient state: SYN_SENT\n\nStep 2 — SYN-ACK (Server → Client)\nServer says "OK, I acknowledge X+1, my sequence number is Y"\nServer state: SYN_RECEIVED\n\nStep 3 — ACK (Client → Server)\nClient says "I acknowledge Y+1, connection established!"\nBoth state: ESTABLISHED\n\nWhy 3 steps? Both sides need to confirm BOTH directions can send and receive. 2 steps only confirms one direction.' }
    ]
  },
  {
    id: '5', course: 'CSE482', solved: false, views: 98,
    title: 'What is gradient descent and why do we use learning rate?',
    body: 'Starting CSE482 and confused about gradient descent. What does it actually do and why does learning rate matter so much?',
    tags: ['Machine Learning', 'Gradient Descent', 'Optimization'],
    time: '6 hours ago',
    answers: []
  },
]

export default function DiscussionsPage() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS)
  const [selected, setSelected] = useState<Question | null>(MOCK_QUESTIONS[0])
  const [search, setSearch] = useState('')
  const [course, setCourse] = useState('All')
  const [filter, setFilter] = useState<'all' | 'unsolved'>('all')
  const [showAskForm, setShowAskForm] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [upvotedAnswers, setUpvotedAnswers] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({ title: '', body: '', course: 'CSE220', tags: '' })

  useEffect(() => {
    const saved = localStorage.getItem('bracu_upvoted_answers')
    if (saved) setUpvotedAnswers(JSON.parse(saved))
  }, [])

  const courses = ['All', ...Array.from(new Set(MOCK_QUESTIONS.map(q => q.course)))]

  const filtered = questions
    .filter(q => course === 'All' || q.course === course)
    .filter(q => filter === 'all' || !q.solved)
    .filter(q => !search || (q.title + q.body + q.tags.join(' ')).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.answers.length - a.answers.length)

  const upvoteAnswer = (qId: string, aId: string) => {
    if (upvotedAnswers[aId]) return
    const newUpvoted = { ...upvotedAnswers, [aId]: true }
    setUpvotedAnswers(newUpvoted)
    localStorage.setItem('bracu_upvoted_answers', JSON.stringify(newUpvoted))
    setQuestions(p => p.map(q => q.id !== qId ? q : {
      ...q,
      answers: q.answers.map(a => a.id !== aId ? a : { ...a, upvotes: a.upvotes + 1 })
    }))
    if (selected?.id === qId) {
      setSelected(prev => prev ? {
        ...prev,
        answers: prev.answers.map(a => a.id !== aId ? a : { ...a, upvotes: a.upvotes + 1 })
      } : null)
    }
  }

  const acceptAnswer = (qId: string, aId: string) => {
    setQuestions(p => p.map(q => q.id !== qId ? q : {
      ...q, solved: true,
      answers: q.answers.map(a => ({ ...a, accepted: a.id === aId }))
    }))
    if (selected?.id === qId) {
      setSelected(prev => prev ? {
        ...prev, solved: true,
        answers: prev.answers.map(a => ({ ...a, accepted: a.id === aId }))
      } : null)
    }
  }

  const submitAnswer = (qId: string) => {
    if (!answerText.trim() || answerText.length < 10) return
    const newAnswer: Answer = {
      id: Date.now().toString(),
      text: answerText,
      upvotes: 0,
      time: 'Just now',
      accepted: false,
    }
    setQuestions(p => p.map(q => q.id !== qId ? q : { ...q, answers: [...q.answers, newAnswer] }))
    if (selected?.id === qId) {
      setSelected(prev => prev ? { ...prev, answers: [...prev.answers, newAnswer] } : null)
    }
    setAnswerText('')
  }

  const askQuestion = () => {
    if (!form.title || !form.body) return
    const newQ: Question = {
      id: Date.now().toString(),
      title: form.title,
      body: form.body,
      course: form.course,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      answers: [],
      views: 0,
      time: 'Just now',
      solved: false,
    }
    setQuestions(p => [newQ, ...p])
    setSelected(newQ)
    setForm({ title: '', body: '', course: 'CSE220', tags: '' })
    setShowAskForm(false)
  }

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Course Discussions"
      title="Ask. Answer.<br/>Help each other."
      subtitle="Course-specific Q&A from students who actually took the course. Real answers, not generic ones."
    >
      {/* Ask form */}
      {showAskForm && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Ask a Question</div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Question Title</label>
            <input style={inp} placeholder="How do you implement BST deletion?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Details</label>
            <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Explain what you've tried and what's confusing you..."
              rows={4} style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Course</label>
              <select style={inp} value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}>
                {['CSE110', 'CSE111', 'CSE220', 'CSE221', 'CSE341', 'CSE370', 'CSE471', 'CSE482', 'MAT215', 'MAT216', 'PHY111', 'ENG101'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Tags (comma separated)</label>
              <input style={inp} placeholder="BST, Trees, Deletion" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>
          <button onClick={askQuestion}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Post Question →
          </button>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', minHeight: '600px' }}>

        {/* Question list */}
        <div style={{ background: 'var(--ink)', display: 'flex', flexDirection: 'column' }}>
          {/* Controls */}
          <div style={{ padding: '14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                style={{ flex: 1, background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '8px 12px', outline: 'none' }}
                placeholder="Search questions..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
              <button onClick={() => setShowAskForm(p => !p)}
                style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '8px 12px', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', flexShrink: 0 }}>
                + Ask
              </button>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(['all', 'unsolved'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '4px 10px', background: filter === f ? 'var(--red)' : 'transparent', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${filter === f ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                  {f === 'all' ? 'All' : '❓ Unsolved'}
                </button>
              ))}
              <select value={course} onChange={e => setCourse(e.target.value)}
                style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '9px', padding: '4px 8px', outline: 'none' }}>
                {courses.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(q => (
              <div key={q.id}
                onClick={() => setSelected(q)}
                style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', cursor: 'crosshair', background: selected?.id === q.id ? 'var(--ink2)' : 'transparent', borderLeft: selected?.id === q.id ? '2px solid var(--red)' : '2px solid transparent', transition: 'all .15s' }}
                onMouseEnter={e => { if (selected?.id !== q.id) e.currentTarget.style.background = 'rgba(242,237,228,0.02)' }}
                onMouseLeave={e => { if (selected?.id !== q.id) e.currentTarget.style.background = 'transparent' }}>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.3)', padding: '2px 6px', flexShrink: 0, marginTop: '2px' }}>{q.course}</span>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.3 }}>{q.title}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {q.solved
                    ? <span style={{ fontSize: '9px', color: '#5fd49a', letterSpacing: '1px' }}>✓ Solved</span>
                    : <span style={{ fontSize: '9px', color: 'var(--bronze)', letterSpacing: '1px' }}>❓ Unsolved</span>
                  }
                  <span style={{ fontSize: '9px', color: 'var(--faded)' }}>{q.answers.length} answers</span>
                  <span style={{ fontSize: '9px', color: 'var(--faded)' }}>{q.views} views</span>
                  <span style={{ fontSize: '9px', color: 'var(--dim)', marginLeft: 'auto' }}>{q.time}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px' }}>
                No questions found. Ask the first one!
              </div>
            )}
          </div>
        </div>

        {/* Question detail */}
        {selected ? (
          <div style={{ background: 'var(--ink2)', display: 'flex', flexDirection: 'column' }}>
            {/* Question */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.3)', padding: '3px 8px' }}>{selected.course}</span>
                {selected.solved
                  ? <span style={{ fontSize: '9px', color: '#5fd49a', letterSpacing: '1px' }}>✓ Solved</span>
                  : <span style={{ fontSize: '9px', color: 'var(--bronze)', letterSpacing: '1px' }}>❓ Needs Answer</span>
                }
                <span style={{ fontSize: '9px', color: 'var(--dim)', marginLeft: 'auto' }}>{selected.time}</span>
              </div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)', letterSpacing: '1px', lineHeight: 1.2, marginBottom: '12px' }}>{selected.title}</div>
              <p style={{ fontSize: '12px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '12px' }}>{selected.body}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selected.tags.map((t, i) => (
                  <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid var(--border)', padding: '2px 8px', color: 'var(--faded)' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Answers */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
              {selected.answers.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px' }}>
                  No answers yet. Be the first to help!
                </div>
              )}
              {[...selected.answers].sort((a, b) => (b.accepted ? 1 : 0) - (a.accepted ? 1 : 0) || b.upvotes - a.upvotes).map(a => (
                <div key={a.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: a.accepted ? 'rgba(95,212,154,0.04)' : 'transparent', borderLeft: a.accepted ? '2px solid #5fd49a' : '2px solid transparent' }}>
                  {a.accepted && (
                    <div style={{ fontSize: '9px', color: '#5fd49a', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>✓ Accepted Answer</div>
                  )}
                  <pre style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace', marginBottom: '12px', wordBreak: 'break-word' }}>{a.text}</pre>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => upvoteAnswer(selected.id, a.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: upvotedAnswers[a.id] ? 'rgba(232,57,14,0.1)' : 'none', border: `1px solid ${upvotedAnswers[a.id] ? 'rgba(232,57,14,0.3)' : 'var(--border)'}`, color: upvotedAnswers[a.id] ? 'var(--red)' : 'var(--faded)', padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: upvotedAnswers[a.id] ? 'default' : 'crosshair', transition: 'all .15s' }}>
                      ▲ {a.upvotes}
                    </button>
                    {!a.accepted && !selected.solved && (
                      <button onClick={() => acceptAnswer(selected.id, a.id)}
                        style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5fd49a', background: 'none', border: '1px solid rgba(95,212,154,0.3)', padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                        ✓ Accept
                      </button>
                    )}
                    <span style={{ fontSize: '9px', color: 'var(--dim)', marginLeft: 'auto' }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Answer input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <label style={lbl}>Your Answer</label>
              <textarea
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                placeholder="Share your knowledge. Be specific. Code examples welcome."
                rows={4}
                style={{ ...inp, resize: 'none', lineHeight: 1.7, marginBottom: '10px' }}
              />
              <button onClick={() => submitAnswer(selected.id)} disabled={answerText.length < 10}
                style={{ background: answerText.length >= 10 ? 'var(--paper)' : 'var(--dim)', color: 'var(--ink)', border: 'none', padding: '11px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: answerText.length >= 10 ? 'crosshair' : 'not-allowed' }}>
                Post Answer →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--ink2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--faded)', fontSize: '11px', letterSpacing: '1px' }}>
              Select a question to view answers
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Questions', val: questions.length },
          { label: 'Solved', val: questions.filter(q => q.solved).length },
          { label: 'Total Answers', val: questions.reduce((a, q) => a + q.answers.length, 0) },
          { label: 'Unsolved', val: questions.filter(q => !q.solved).length },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}