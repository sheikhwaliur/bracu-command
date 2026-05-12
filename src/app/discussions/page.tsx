'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { checkRateLimit } from '@/lib/rateLimit'
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

// KEEP ALL YOUR MOCK_QUESTIONS ARRAY EXACTLY THE SAME
// (Your existing MOCK_QUESTIONS code goes here unchanged)

const MOCK_QUESTIONS: Question[] = [
    {
      id: '1', course: 'CSE220', solved: true, views: 234,
      title: 'How do you implement a binary search tree deletion with all 3 cases?',
      body: 'I understand insertion and search but deletion with 3 cases (leaf, one child, two children) is confusing me. Can someone explain with code?',
      tags: ['BST', 'Trees', 'Deletion'],
      time: '3 days ago',
      answers: [
        { id: 'a1', upvotes: 34, accepted: true, time: '3 days ago', text: 'BST deletion has 3 cases:\n\n1. Node is a leaf → just delete it\n2. Node has 1 child → replace node with its child\n3. Node has 2 children → find inorder successor (smallest in right subtree), copy its value to current node, delete the successor\n\nFor case 3, the inorder successor always has at most 1 child (right child), so it reduces to case 1 or 2.' },
        { id: 'a2', upvotes: 12, accepted: false, time: '2 days ago', text: 'For the exam, Sir usually asks to trace through deletion on a drawn tree. Practice drawing the before and after states, especially for case 3. Past papers 2021-2023 all had this.' }
      ]
    },
    {
      id: '2', course: 'MAT215', solved: false, views: 187,
      title: 'What is the intuition behind eigenvalues — not just the formula?',
      body: 'I can solve eigenvalue problems but I don\'t understand what they actually represent geometrically. Can anyone explain the real concept?',
      tags: ['Eigenvalues', 'Linear Algebra', 'Intuition'],
      time: '1 day ago',
      answers: [
        { id: 'a3', upvotes: 28, accepted: false, time: '1 day ago', text: 'Think of a matrix as a transformation — it rotates and stretches space.\n\nMost vectors change direction when multiplied by a matrix. But some special vectors only get stretched or shrunk — they don\'t change direction. These are eigenvectors.\n\nThe eigenvalue is HOW MUCH it gets stretched. λ=2 means doubled. λ=−1 means flipped. λ=0 means collapsed to zero.' }
      ]
    },
    {
      id: '3', course: 'CSE341', solved: true, views: 312,
      title: 'Difference between process and thread in OS — exam level answer?',
      body: 'I know the basic difference but in exams they ask for more detail. What are the key points to include?',
      tags: ['Process', 'Thread', 'OS'],
      time: '5 days ago',
      answers: [
        { id: 'a4', upvotes: 45, accepted: true, time: '5 days ago', text: 'PROCESS vs THREAD — exam answer:\n\nProcess:\n→ Independent program in execution\n→ Has its own memory space\n→ Communication via IPC\n→ Context switch is expensive\n\nThread:\n→ Lightweight unit of a process\n→ Shares memory with other threads\n→ Communication via shared memory\n→ Context switch is cheaper' }
      ]
    },
    {
      id: '4', course: 'CSE471', solved: false, views: 143,
      title: 'How does TCP\'s 3-way handshake work step by step?',
      body: 'The textbook explanation is confusing. Can someone explain it simply with what each party does at each step?',
      tags: ['TCP', 'Networking', '3-way handshake'],
      time: '2 days ago',
      answers: [
        { id: 'a5', upvotes: 19, accepted: false, time: '2 days ago', text: 'TCP 3-way handshake simplified:\n\nStep 1 — SYN (Client → Server)\nClient says "I want to connect, my sequence number is X"\n\nStep 2 — SYN-ACK (Server → Client)\nServer says "OK, I acknowledge X+1, my sequence number is Y"\n\nStep 3 — ACK (Client → Server)\nClient says "I acknowledge Y+1, connection established!"' }
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
  const [form, setForm] = useState({
    title: '',
    body: '',
    course: 'CSE220',
    tags: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('bracu_upvoted_answers')
    if (saved) {
      setUpvotedAnswers(JSON.parse(saved))
    }
  }, [])

  const courses = ['All', ...Array.from(new Set(MOCK_QUESTIONS.map(q => q.course)))]

  const filtered = questions
    .filter(q => course === 'All' || q.course === course)
    .filter(q => filter === 'all' || !q.solved)
    .filter(
      q =>
        !search ||
        (q.title + q.body + q.tags.join(' '))
          .toLowerCase()
          .includes(search.toLowerCase())
    )
    .sort((a, b) => b.answers.length - a.answers.length)

  const upvoteAnswer = (qId: string, aId: string) => {
    if (upvotedAnswers[aId]) return

    const newUpvoted = { ...upvotedAnswers, [aId]: true }
    setUpvotedAnswers(newUpvoted)
    localStorage.setItem(
      'bracu_upvoted_answers',
      JSON.stringify(newUpvoted)
    )

    setQuestions(prev =>
      prev.map(q =>
        q.id !== qId
          ? q
          : {
              ...q,
              answers: q.answers.map(a =>
                a.id !== aId ? a : { ...a, upvotes: a.upvotes + 1 }
              )
            }
      )
    )

    if (selected?.id === qId) {
      setSelected(prev =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map(a =>
                a.id !== aId ? a : { ...a, upvotes: a.upvotes + 1 }
              )
            }
          : null
      )
    }
  }

  const acceptAnswer = (qId: string, aId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id !== qId
          ? q
          : {
              ...q,
              solved: true,
              answers: q.answers.map(a => ({
                ...a,
                accepted: a.id === aId
              }))
            }
      )
    )

    if (selected?.id === qId) {
      setSelected(prev =>
        prev
          ? {
              ...prev,
              solved: true,
              answers: prev.answers.map(a => ({
                ...a,
                accepted: a.id === aId
              }))
            }
          : null
      )
    }
  }

  const submitAnswer = (qId: string) => {
    const { allowed, waitSeconds } = checkRateLimit({ key: 'answer', limitMs: 60000, maxAttempts: 5 })
    if (!allowed) {
      alert(`Please wait ${waitSeconds} seconds before answering again.`)
      return
    }
    if (!answerText.trim() || answerText.length < 10) return

    const newAnswer: Answer = {
      id: Date.now().toString(),
      text: answerText,
      upvotes: 0,
      time: 'Just now',
      accepted: false
    }

    setQuestions(prev =>
      prev.map(q =>
        q.id !== qId
          ? q
          : {
              ...q,
              answers: [...q.answers, newAnswer]
            }
      )
    )

    if (selected?.id === qId) {
      setSelected(prev =>
        prev
          ? {
              ...prev,
              answers: [...prev.answers, newAnswer]
            }
          : null
      )
    }

    setAnswerText('')
  }

  const askQuestion = () => {
    const { allowed, waitSeconds } = checkRateLimit({ key: 'question', limitMs: 300000, maxAttempts: 3 })
    if (!allowed) {
      alert(`Please wait ${waitSeconds} seconds before posting again.`)
      return
    }
    if (!form.title || !form.body) return

    const newQ: Question = {
      id: Date.now().toString(),
      title: form.title,
      body: form.body,
      course: form.course,
      tags: form.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      answers: [],
      views: 0,
      time: 'Just now',
      solved: false
    }

    setQuestions(prev => [newQ, ...prev])
    setSelected(newQ)

    setForm({
      title: '',
      body: '',
      course: 'CSE220',
      tags: ''
    })

    setShowAskForm(false)
  }

  // FIXED TYPE ISSUE HERE
  const inp: CSSProperties = {
    background: 'var(--ink)',
    border: '1px solid var(--border)',
    color: 'var(--paper)',
    fontFamily: 'IBM Plex Mono,monospace',
    fontSize: '12px',
    padding: '9px 12px',
    outline: 'none',
    width: '100%'
  }

  const lbl: CSSProperties = {
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--faded)',
    display: 'block',
    marginBottom: '6px',
    fontWeight: 700
  }

  return (
    <PageLayout
          eyebrow="Course Discussions"
          title="Ask. Answer.<br/>Help each other."
          subtitle="Course-specific Q&A from students who actually took the course. Real answers, not generic ones." children={undefined}    >
      {/* KEEP THE REST OF YOUR JSX EXACTLY THE SAME */}
    </PageLayout>
  )
}