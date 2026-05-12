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