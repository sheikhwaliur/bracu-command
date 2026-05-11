'use client'
import { useState, useEffect, useRef } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Question {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
  marks: number
  topic: string
}

interface Exam {
  id: string
  course: string
  type: 'midterm' | 'final' | 'quiz'
  duration: number
  totalMarks: number
  questions: Question[]
}

const EXAM_BANK: Record<string, Exam> = {
  'CSE220 Midterm': {
    id: '1', course: 'CSE220', type: 'midterm', duration: 60, totalMarks: 30,
    questions: [
      { id: 'q1', marks: 3, topic: 'Arrays', question: 'What is the time complexity of accessing an element by index in an array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 0, explanation: 'Arrays store elements in contiguous memory, so any element can be accessed directly via its index in constant time O(1).' },
      { id: 'q2', marks: 3, topic: 'Linked Lists', question: 'Which of the following is NOT an advantage of linked lists over arrays?', options: ['Dynamic size', 'Efficient insertion at beginning', 'O(1) random access', 'No wasted memory'], correct: 2, explanation: 'Linked lists do NOT support O(1) random access — you must traverse from head, making it O(n). Arrays support O(1) random access.' },
      { id: 'q3', marks: 3, topic: 'Stacks', question: 'What data structure is used to implement function call management in programming languages?', options: ['Queue', 'Stack', 'Heap', 'Tree'], correct: 1, explanation: 'The call stack uses a Stack data structure (LIFO). Each function call pushes a frame, and return pops it.' },
      { id: 'q4', marks: 3, topic: 'BST', question: 'In a Binary Search Tree, where is the smallest element always located?', options: ['Root', 'Rightmost node', 'Leftmost node', 'Any leaf node'], correct: 2, explanation: 'In a BST, all left children are smaller. So the smallest element is always the leftmost node (keep going left until null).' },
      { id: 'q5', marks: 3, topic: 'Hashing', question: 'Which collision resolution technique uses a linked list at each bucket?', options: ['Open addressing', 'Linear probing', 'Chaining', 'Quadratic probing'], correct: 2, explanation: 'Chaining stores multiple elements at the same hash bucket using a linked list. Other options are forms of open addressing.' },
      { id: 'q6', marks: 3, topic: 'Queues', question: 'Which traversal algorithm uses a Queue data structure?', options: ['DFS', 'BFS', 'Inorder traversal', 'Postorder traversal'], correct: 1, explanation: 'BFS (Breadth-First Search) uses a Queue. It processes nodes level by level, which matches FIFO behavior.' },
      { id: 'q7', marks: 3, topic: 'Trees', question: 'What is the maximum number of nodes in a binary tree of height h?', options: ['2h', '2h - 1', '2^(h+1) - 1', '2^h'], correct: 2, explanation: 'A full binary tree of height h has 2^(h+1) - 1 nodes. Level 0 has 1 node, level 1 has 2, ..., level h has 2^h nodes. Sum = 2^(h+1) - 1.' },
      { id: 'q8', marks: 3, topic: 'Sorting', question: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort — O(n²)', 'Insertion Sort — O(n²)', 'Merge Sort — O(n log n)', 'Selection Sort — O(n²)'], correct: 2, explanation: 'Merge Sort has O(n log n) in all cases (best, average, worst). Bubble, Insertion, and Selection Sort are all O(n²) average case.' },
      { id: 'q9', marks: 3, topic: 'Complexity', question: 'What is the time complexity of finding the height of a binary tree recursively?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 2, explanation: 'To find height, we must visit every node once to compare left and right subtree heights. This is O(n).' },
      { id: 'q10', marks: 3, topic: 'Hash Tables', question: 'What happens to a hash table\'s performance as the load factor increases?', options: ['Improves', 'Stays constant', 'Degrades', 'Becomes O(1)'], correct: 2, explanation: 'As load factor (elements/buckets) increases, more collisions occur, degrading performance. Rehashing is triggered when load factor exceeds a threshold (typically 0.75).' },
    ]
  },
  'CSE221 Quiz': {
    id: '2', course: 'CSE221', type: 'quiz', duration: 20, totalMarks: 15,
    questions: [
      { id: 'a1', marks: 3, topic: 'Sorting', question: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correct: 1, explanation: 'QuickSort\'s worst case is O(n²) when the pivot is always the smallest or largest element (already sorted array with bad pivot choice). Average case is O(n log n).' },
      { id: 'a2', marks: 3, topic: 'Graph', question: 'In Dijkstra\'s algorithm, which data structure gives the best performance?', options: ['Stack', 'Queue', 'Priority Queue (Min-Heap)', 'Array'], correct: 2, explanation: 'A priority queue (min-heap) gives O((V+E) log V) for Dijkstra. It efficiently finds the unvisited vertex with minimum distance.' },
      { id: 'a3', marks: 3, topic: 'DP', question: 'What is the time complexity of the 0/1 Knapsack problem solved with dynamic programming?', options: ['O(n)', 'O(n log n)', 'O(nW)', 'O(2^n)'], correct: 2, explanation: 'The DP solution builds a table of size n×W (items × capacity). Filling each cell is O(1), so total is O(nW). The brute force is O(2^n).' },
      { id: 'a4', marks: 3, topic: 'Greedy', question: 'Which algorithm is used to find the Minimum Spanning Tree of a graph?', options: ['Dijkstra\'s', 'Bellman-Ford', 'Kruskal\'s', 'Floyd-Warshall'], correct: 2, explanation: 'Kruskal\'s algorithm finds the MST by greedily adding the smallest edges that don\'t create a cycle. Prim\'s algorithm is another MST algorithm.' },
      { id: 'a5', marks: 3, topic: 'Complexity', question: 'What does "NP-Complete" mean?', options: ['Not Polynomial', 'Non-deterministic Polynomial complete', 'No Possible solution', 'Null Polynomial'], correct: 1, explanation: 'NP-Complete problems are in NP (solution verifiable in polynomial time) and are NP-Hard (every NP problem reducible to it). No polynomial-time algorithm is known for them.' },
    ]
  },
  'MAT215 Midterm': {
    id: '3', course: 'MAT215', type: 'midterm', duration: 60, totalMarks: 24,
    questions: [
      { id: 'm1', marks: 3, topic: 'Vectors', question: 'What is the dot product of vectors [1,2,3] and [4,5,6]?', options: ['21', '32', '17', '12'], correct: 1, explanation: 'Dot product = 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32. The dot product gives a scalar.' },
      { id: 'm2', marks: 3, topic: 'Matrices', question: 'What is the determinant of a 2×2 matrix [[a,b],[c,d]]?', options: ['ad + bc', 'ac - bd', 'ad - bc', 'ab + cd'], correct: 2, explanation: 'For 2×2 matrix [[a,b],[c,d]], det = ad - bc. This is the area of the parallelogram formed by the column vectors.' },
      { id: 'm3', marks: 3, topic: 'Eigenvalues', question: 'If Av = λv, what is v called?', options: ['Eigenvalue', 'Eigenvector', 'Determinant', 'Trace'], correct: 1, explanation: 'v is the eigenvector — the vector whose direction is unchanged by transformation A. λ is the eigenvalue (the scaling factor).' },
      { id: 'm4', marks: 3, topic: 'Linear Systems', question: 'A system of linear equations has no solution when the system is:', options: ['Consistent', 'Inconsistent', 'Homogeneous', 'Square'], correct: 1, explanation: 'An inconsistent system has no solution (contradictory equations, e.g., x = 1 and x = 2). A consistent system has at least one solution.' },
      { id: 'm5', marks: 3, topic: 'Rank', question: 'The rank of a matrix is:', options: ['Number of rows', 'Number of columns', 'Number of linearly independent rows', 'Determinant value'], correct: 2, explanation: 'Rank = number of linearly independent rows (= number of non-zero rows in row echelon form). It equals the dimension of the row space.' },
      { id: 'm6', marks: 3, topic: 'Transformations', question: 'A linear transformation T: R² → R² that rotates vectors by 90° is represented by what matrix?', options: ['[[1,0],[0,1]]', '[[0,-1],[1,0]]', '[[0,1],[-1,0]]', '[[-1,0],[0,-1]]'], correct: 1, explanation: '90° counter-clockwise rotation matrix is [[cos90°,-sin90°],[sin90°,cos90°]] = [[0,-1],[1,0]]. Applying to [1,0] gives [0,1] ✓.' },
      { id: 'm7', marks: 3, topic: 'Orthogonality', question: 'Two vectors u and v are orthogonal when:', options: ['u·v = 1', 'u·v = 0', '|u| = |v|', 'u = v'], correct: 1, explanation: 'Vectors are orthogonal (perpendicular) when their dot product is zero. Cos(90°) = 0, so u·v = |u||v|cos(90°) = 0.' },
      { id: 'm8', marks: 3, topic: 'Inverse', question: 'A matrix A is invertible if and only if:', options: ['A is square', 'A is symmetric', 'det(A) ≠ 0', 'A has more rows than columns'], correct: 2, explanation: 'A matrix is invertible (non-singular) if and only if its determinant is non-zero. If det(A) = 0, the matrix is singular and has no inverse.' },
    ]
  },
}

export default function MockExamPage() {
  const [selectedExam, setSelectedExam] = useState<string>('CSE220 Midterm')
  const [examStarted, setExamStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const exam = EXAM_BANK[selectedExam]

  useEffect(() => {
    if (examStarted && !submitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { submitExam(); return 0 }
          return p - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [examStarted, submitted])

  const startExam = () => {
    setAnswers({})
    setSubmitted(false)
    setShowReview(false)
    setTimeLeft(exam.duration * 60)
    setExamStarted(true)
  }

  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitted(true)
    setExamStarted(false)
  }

  const answered = Object.keys(answers).length
  const correct = submitted ? exam.questions.filter(q => answers[q.id] === q.correct).length : 0
  const score = submitted ? exam.questions.filter(q => answers[q.id] === q.correct).reduce((a, q) => a + q.marks, 0) : 0
  const pct = submitted ? (score / exam.totalMarks) * 100 : 0

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#5fd49a', msg: 'Outstanding!' }
    if (pct >= 80) return { grade: 'A', color: '#5fd49a', msg: 'Excellent!' }
    if (pct >= 70) return { grade: 'B+', color: 'var(--bronze)', msg: 'Good job!' }
    if (pct >= 60) return { grade: 'B', color: 'var(--bronze)', msg: 'Keep studying!' }
    if (pct >= 50) return { grade: 'C', color: 'var(--red)', msg: 'Needs improvement.' }
    return { grade: 'F', color: 'var(--red)', msg: 'Review the material.' }
  }

  const gradeInfo = getGrade(pct)

  return (
    <PageLayout
      eyebrow="Mock Exam Generator"
      title="Practice like it's<br/>the real thing."
      subtitle="Timed mock exams based on BRACU past paper patterns. Get graded, review mistakes, improve."
    >
      {!examStarted && !submitted && (
        <>
          {/* Exam selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: 'var(--border)', marginBottom: '24px' }}>
            {Object.keys(EXAM_BANK).map(name => {
              const e = EXAM_BANK[name]
              return (
                <button key={name} onClick={() => setSelectedExam(name)}
                  style={{ background: selectedExam === name ? 'rgba(232,57,14,0.08)' : 'var(--ink)', border: 'none', borderBottom: `2px solid ${selectedExam === name ? 'var(--red)' : 'transparent'}`, padding: '20px', textAlign: 'left', cursor: 'crosshair', transition: 'all .15s', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: selectedExam === name ? 'var(--red)' : 'var(--faded)', marginBottom: '6px' }}>{e.course} · {e.type}</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '6px' }}>{name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.8 }}>
                    {e.questions.length} questions · {e.totalMarks} marks · {e.duration} min
                  </div>
                </button>
              )
            })}
          </div>

          {/* Exam info */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '28px 32px', marginBottom: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '8px', fontWeight: 700 }}>// {selectedExam}</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: 'var(--paper)', letterSpacing: '2px', lineHeight: 1, marginBottom: '12px' }}>{exam.course} {exam.type.toUpperCase()}</div>
                <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
                  Based on actual BRACU past paper patterns from 2021–2024. Questions are designed to match the difficulty and style of real {exam.type} exams.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'var(--border)' }}>
                {[
                  { label: 'Questions', val: exam.questions.length },
                  { label: 'Total Marks', val: exam.totalMarks },
                  { label: 'Duration', val: `${exam.duration} min` },
                  { label: 'Per Question', val: `${exam.questions[0]?.marks} marks` },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--ink)', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(232,57,14,0.05)', border: '1px solid rgba(232,57,14,0.15)', fontSize: '10px', color: 'var(--faded)', lineHeight: 1.9 }}>
              ⚠️ Once you start, the timer begins immediately and cannot be paused. Answer all questions before submitting or time runs out.
            </div>

            <button onClick={startExam} style={{ marginTop: '20px', background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '16px 40px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
              Start Exam →
            </button>
          </div>

          {/* Tips */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>EXAM TIPS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['Read all options before choosing — eliminate wrong ones first', 'If unsure, mark and come back — don\'t waste time', 'For MCQs, one wrong answer often reveals the right one', 'Trust your first instinct — overthinking hurts MCQ scores'].map((tip, i) => (
                <div key={i} style={{ fontSize: '10px', color: 'var(--faded)', padding: '8px 12px', background: 'var(--ink)', border: '1px solid var(--border)', lineHeight: 1.7, display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--red)', flexShrink: 0 }}>→</span>{tip}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* EXAM IN PROGRESS */}
      {examStarted && (
        <div>
          {/* Exam header */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: '52px', zIndex: 100, backdropFilter: 'blur(16px)' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)', letterSpacing: '.5px' }}>{selectedExam}</div>
              <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '2px' }}>{answered}/{exam.questions.length} answered</div>
            </div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '32px', color: timeLeft < 300 ? 'var(--red)' : timeLeft < 600 ? 'var(--bronze)' : 'var(--paper)', letterSpacing: '3px' }}>
              {formatTime(timeLeft)}
            </div>
            <button onClick={submitExam}
              style={{ background: answered === exam.questions.length ? 'var(--paper)' : 'var(--red)', color: 'var(--ink)', border: 'none', padding: '10px 20px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
              Submit →
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ background: 'rgba(242,237,228,0.06)', height: '3px', marginBottom: '20px' }}>
            <div style={{ height: '100%', background: 'var(--red)', width: `${(answered / exam.questions.length) * 100}%`, transition: 'width .3s' }} />
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {exam.questions.map((q, qi) => (
              <div key={q.id} style={{ background: 'var(--ink)', border: `1px solid ${answers[q.id] !== undefined ? 'rgba(95,212,154,0.2)' : 'var(--border)'}`, padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)', letterSpacing: '1px', flexShrink: 0, lineHeight: 1 }}>Q{qi + 1}</div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--paper)', lineHeight: 1.5, marginBottom: '4px' }}>{q.question}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>{q.topic} · {q.marks} marks</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '34px' }}>
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers(p => ({ ...p, [q.id]: oi }))}
                      style={{ textAlign: 'left', background: answers[q.id] === oi ? 'rgba(232,57,14,0.1)' : 'var(--ink2)', border: `1px solid ${answers[q.id] === oi ? 'rgba(232,57,14,0.4)' : 'var(--border)'}`, color: answers[q.id] === oi ? 'var(--paper)' : 'var(--faded)', padding: '10px 14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', cursor: 'crosshair', transition: 'all .15s', display: 'flex', gap: '10px', alignItems: 'center', lineHeight: 1.5 }}>
                      <span style={{ color: answers[q.id] === oi ? 'var(--red)' : 'var(--dim)', fontWeight: 700, flexShrink: 0 }}>{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <button onClick={submitExam}
              style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '14px 48px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
              Submit Exam →
            </button>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {submitted && (
        <div>
          {/* Score card */}
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '40px', textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '60px', right: '60px', height: '1px', background: `linear-gradient(90deg,transparent,${gradeInfo.color},transparent)` }} />
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '80px', color: gradeInfo.color, letterSpacing: '4px', lineHeight: 1 }}>{gradeInfo.grade}</div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '40px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '8px' }}>{score}/{exam.totalMarks}</div>
            <div style={{ fontSize: '16px', color: gradeInfo.color, marginBottom: '8px' }}>{pct.toFixed(1)}%</div>
            <div style={{ fontSize: '12px', color: 'var(--faded)', marginBottom: '24px' }}>{gradeInfo.msg} · {correct}/{exam.questions.length} correct</div>

            {/* Score breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', margin: '0 auto', maxWidth: '500px' }}>
              {[
                { label: 'Correct', val: correct, color: '#5fd49a' },
                { label: 'Wrong', val: exam.questions.length - correct - (exam.questions.length - answered), color: 'var(--red)' },
                { label: 'Skipped', val: exam.questions.length - answered, color: 'var(--faded)' },
                { label: 'Score', val: `${pct.toFixed(0)}%`, color: gradeInfo.color },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--ink)', padding: '14px 10px' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: s.color, letterSpacing: '1px' }}>{s.val}</div>
                  <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '24px' }}>
              <button onClick={() => setShowReview(p => !p)}
                style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                {showReview ? 'Hide Review' : 'Review Answers →'}
              </button>
              <button onClick={startExam}
                style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '12px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                Retry →
              </button>
              <button onClick={() => { setSubmitted(false); setExamStarted(false) }}
                style={{ background: 'transparent', color: 'var(--faded)', border: '1px solid var(--border)', padding: '12px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'crosshair' }}>
                New Exam →
              </button>
            </div>
          </div>

          {/* Answer review */}
          {showReview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {exam.questions.map((q, qi) => {
                const userAns = answers[q.id]
                const isCorrect = userAns === q.correct
                return (
                  <div key={q.id} style={{ background: 'var(--ink)', border: `1px solid ${isCorrect ? 'rgba(95,212,154,0.2)' : 'rgba(232,57,14,0.2)'}`, padding: '18px 22px', borderLeft: `3px solid ${isCorrect ? '#5fd49a' : 'var(--red)'}` }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: isCorrect ? '#5fd49a' : 'var(--red)', flexShrink: 0 }}>
                        {isCorrect ? '✓' : '✗'} Q{qi + 1}
                      </span>
                      <div style={{ fontSize: '12px', color: 'var(--paper)', lineHeight: 1.5 }}>{q.question}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '32px', marginBottom: '12px' }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ padding: '7px 12px', background: oi === q.correct ? 'rgba(95,212,154,0.08)' : oi === userAns && !isCorrect ? 'rgba(232,57,14,0.08)' : 'transparent', border: `1px solid ${oi === q.correct ? 'rgba(95,212,154,0.3)' : oi === userAns && !isCorrect ? 'rgba(232,57,14,0.3)' : 'var(--border)'}`, fontSize: '11px', color: oi === q.correct ? '#5fd49a' : oi === userAns && !isCorrect ? 'var(--red)' : 'var(--faded)', display: 'flex', gap: '8px' }}>
                          <span style={{ flexShrink: 0, fontWeight: 700 }}>{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                          {oi === q.correct && <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#5fd49a' }}>✓ Correct</span>}
                          {oi === userAns && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: '9px', color: 'var(--red)' }}>✗ Your answer</span>}
                        </div>
                      ))}
                    </div>
                    <div style={{ paddingLeft: '32px', padding: '10px 14px', background: 'rgba(242,237,228,0.02)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8 }}>
                      <span style={{ color: 'var(--bronze)', fontWeight: 700 }}>Explanation: </span>{q.explanation}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}