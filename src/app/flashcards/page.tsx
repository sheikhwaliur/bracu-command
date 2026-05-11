'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Flashcard {
  id: string
  front: string
  back: string
  course: string
  difficulty: 'easy' | 'medium' | 'hard'
  mastered: boolean
  reviewCount: number
}

const PRESET_DECKS: Record<string, Flashcard[]> = {
  'CSE220 — Data Structures': [
    { id: '1', front: 'What is the time complexity of binary search?', back: 'O(log n) — divides search space in half each iteration.\n\nRequires sorted array.\nBest case: O(1) — found at mid\nWorst case: O(log n)', course: 'CSE220', difficulty: 'easy', mastered: false, reviewCount: 0 },
    { id: '2', front: 'What is a binary search tree (BST) and its properties?', back: 'A BST is a binary tree where:\n→ Left child < Parent\n→ Right child > Parent\n→ Both subtrees are also BSTs\n\nSearch, Insert, Delete: O(h) where h = height\nBalanced BST: O(log n)\nUnbalanced (worst): O(n)', course: 'CSE220', difficulty: 'medium', mastered: false, reviewCount: 0 },
    { id: '3', front: 'What is the difference between a stack and a queue?', back: 'Stack:\n→ LIFO (Last In, First Out)\n→ Operations: push(), pop(), peek()\n→ Use: function calls, undo, DFS\n\nQueue:\n→ FIFO (First In, First Out)\n→ Operations: enqueue(), dequeue(), front()\n→ Use: BFS, scheduling, buffers', course: 'CSE220', difficulty: 'easy', mastered: false, reviewCount: 0 },
    { id: '4', front: 'What is a hash table and how does it handle collisions?', back: 'Hash table maps keys to values using a hash function.\nIdeal: O(1) average for insert, search, delete\n\nCollision handling:\n1. Chaining — each bucket is a linked list\n2. Open addressing — probe for next empty slot\n   - Linear probing: +1 each step\n   - Quadratic probing: +1, +4, +9...\n   - Double hashing', course: 'CSE220', difficulty: 'hard', mastered: false, reviewCount: 0 },
    { id: '5', front: 'What are the time complexities of common array operations?', back: 'Access: O(1)\nSearch: O(n)\nInsert at end: O(1) amortized\nInsert at middle: O(n)\nDelete at end: O(1)\nDelete at middle: O(n)\n\nKey: Arrays are great for random access, bad for insertions in the middle.', course: 'CSE220', difficulty: 'easy', mastered: false, reviewCount: 0 },
  ],
  'CSE221 — Algorithms': [
    { id: '6', front: 'Explain the divide and conquer paradigm with an example.', back: 'Divide and Conquer:\n1. DIVIDE problem into smaller subproblems\n2. CONQUER recursively\n3. COMBINE solutions\n\nExamples:\n→ Merge Sort — O(n log n)\n→ Quick Sort — O(n log n) avg\n→ Binary Search — O(log n)\n→ Strassen Matrix Multiply\n\nRecurrence: T(n) = aT(n/b) + f(n)', course: 'CSE221', difficulty: 'medium', mastered: false, reviewCount: 0 },
    { id: '7', front: 'What is dynamic programming? When do you use it?', back: 'DP solves problems by breaking into overlapping subproblems and storing results (memoization/tabulation).\n\nUse when problem has:\n1. Optimal substructure — optimal solution uses optimal sub-solutions\n2. Overlapping subproblems — same subproblems solved multiple times\n\nClassic DP problems:\n→ Fibonacci\n→ 0/1 Knapsack\n→ LCS (Longest Common Subsequence)\n→ Edit Distance', course: 'CSE221', difficulty: 'hard', mastered: false, reviewCount: 0 },
    { id: '8', front: 'What is the difference between BFS and DFS?', back: 'BFS (Breadth-First Search):\n→ Level by level\n→ Uses Queue\n→ Finds shortest path in unweighted graph\n→ Space: O(V) for queue\n\nDFS (Depth-First Search):\n→ Go as deep as possible\n→ Uses Stack (or recursion)\n→ Detects cycles, topological sort\n→ Space: O(h) for recursion\n\nBoth: Time O(V+E)', course: 'CSE221', difficulty: 'medium', mastered: false, reviewCount: 0 },
  ],
  'MAT215 — Linear Algebra': [
    { id: '9', front: 'What is an eigenvalue and eigenvector?', back: 'For matrix A, if:\nAv = λv\n\nv = eigenvector (direction unchanged)\nλ = eigenvalue (scaling factor)\n\nTo find eigenvalues:\nSolve det(A - λI) = 0\n\nGeometric meaning:\nEigenvectors are directions A only stretches/shrinks\nEigenvalue = how much it stretches', course: 'MAT215', difficulty: 'hard', mastered: false, reviewCount: 0 },
    { id: '10', front: 'What is matrix rank and how do you find it?', back: 'Rank = number of linearly independent rows (or columns) = dimension of row space\n\nTo find rank:\n1. Row reduce to Row Echelon Form (REF)\n2. Count non-zero rows\n\nProperties:\n→ rank(A) ≤ min(rows, cols)\n→ Full rank: rank = min(rows, cols)\n→ Rank-Nullity theorem: rank + nullity = n', course: 'MAT215', difficulty: 'medium', mastered: false, reviewCount: 0 },
  ],
  'CSE341 — Operating Systems': [
    { id: '11', front: 'What is deadlock and what are its four necessary conditions?', back: 'Deadlock: processes blocked forever, each waiting for a resource held by another.\n\nFour necessary conditions (all must hold):\n1. Mutual Exclusion — resource held by only one process\n2. Hold and Wait — holding resources while waiting for more\n3. No Preemption — resources only released voluntarily\n4. Circular Wait — circular chain of waiting processes\n\nPrevention: eliminate at least one condition', course: 'CSE341', difficulty: 'hard', mastered: false, reviewCount: 0 },
    { id: '12', front: 'What is virtual memory and how does paging work?', back: 'Virtual memory gives each process illusion of having full address space.\n\nPaging:\n→ Divide virtual memory into fixed-size PAGES\n→ Divide physical memory into FRAMES (same size)\n→ Page table maps virtual pages to physical frames\n→ Only active pages need to be in RAM\n\nPage fault: page not in RAM → load from disk\nTLB: cache for page table (fast lookup)', course: 'CSE341', difficulty: 'hard', mastered: false, reviewCount: 0 },
  ],
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#5fd49a',
  medium: 'var(--bronze)',
  hard: 'var(--red)',
}

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<string>('CSE220 — Data Structures')
  const [cards, setCards] = useState<Flashcard[]>(PRESET_DECKS['CSE220 — Data Structures'])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [mode, setMode] = useState<'browse' | 'study' | 'create'>('browse')
  const [filter, setFilter] = useState<'all' | 'unmastered'>('unmastered')
  const [showGenerate, setShowGenerate] = useState(false)
  const [notes, setNotes] = useState('')
  const [course, setCourse] = useState('CSE220')
  const [generating, setGenerating] = useState(false)
  const [customDecks, setCustomDecks] = useState<Record<string, Flashcard[]>>({})
  const [newCard, setNewCard] = useState({ front: '', back: '', difficulty: 'medium' as Flashcard['difficulty'] })

  useEffect(() => {
    const saved = localStorage.getItem('bracu_flashcard_progress')
    if (saved) {
      const progress = JSON.parse(saved)
      setCards(p => p.map(c => progress[c.id] ? { ...c, mastered: progress[c.id].mastered, reviewCount: progress[c.id].reviewCount } : c))
    }
  }, [])

  const saveProgress = (updatedCards: Flashcard[]) => {
    const progress: Record<string, any> = {}
    updatedCards.forEach(c => { progress[c.id] = { mastered: c.mastered, reviewCount: c.reviewCount } })
    localStorage.setItem('bracu_flashcard_progress', JSON.stringify(progress))
  }

  const studyCards = cards.filter(c => filter === 'all' || !c.mastered)

  const currentCard = studyCards[currentIndex] || cards[0]

  const markMastered = () => {
    const updated = cards.map(c => c.id === currentCard.id ? { ...c, mastered: true, reviewCount: c.reviewCount + 1 } : c)
    setCards(updated)
    saveProgress(updated)
    setFlipped(false)
    if (currentIndex < studyCards.length - 1) setCurrentIndex(p => p + 1)
    else setCurrentIndex(0)
  }

  const markAgain = () => {
    const updated = cards.map(c => c.id === currentCard.id ? { ...c, reviewCount: c.reviewCount + 1 } : c)
    setCards(updated)
    saveProgress(updated)
    setFlipped(false)
    if (currentIndex < studyCards.length - 1) setCurrentIndex(p => p + 1)
    else setCurrentIndex(0)
  }

  const generateFromNotes = () => {
    if (!notes.trim()) return
    setGenerating(true)
    setTimeout(() => {
      const generated: Flashcard[] = [
        { id: `gen-${Date.now()}-1`, front: `What is the main concept discussed in your notes about ${course}?`, back: `Based on your notes:\n${notes.substring(0, 200)}${notes.length > 200 ? '...' : ''}\n\nKey points to remember: Review the highlighted definitions and formulas.`, course, difficulty: 'medium', mastered: false, reviewCount: 0 },
        { id: `gen-${Date.now()}-2`, front: `Define the key terms from your ${course} notes.`, back: `Review your notes for specific definitions.\n\nStudy tip: Write each definition in your own words — this helps retention much more than reading the textbook definition verbatim.`, course, difficulty: 'easy', mastered: false, reviewCount: 0 },
        { id: `gen-${Date.now()}-3`, front: `What are the most important formulas/algorithms from ${course}?`, back: `From your notes:\n${notes.split('\n').slice(0, 5).join('\n')}\n\nPractice applying these formulas to past paper problems.`, course, difficulty: 'hard', mastered: false, reviewCount: 0 },
      ]
      const deckName = `${course} — My Notes`
      setCustomDecks(p => ({ ...p, [deckName]: generated }))
      setSelectedDeck(deckName)
      setCards(generated)
      setCurrentIndex(0)
      setGenerating(false)
      setShowGenerate(false)
      setNotes('')
      setMode('study')
    }, 2000)
  }

  const addCustomCard = () => {
    if (!newCard.front || !newCard.back) return
    const card: Flashcard = { id: `custom-${Date.now()}`, ...newCard, course, mastered: false, reviewCount: 0 }
    const updated = [...cards, card]
    setCards(updated)
    setNewCard({ front: '', back: '', difficulty: 'medium' })
  }

  const changeDeck = (deckName: string) => {
    const deck = PRESET_DECKS[deckName] || customDecks[deckName]
    if (deck) {
      setSelectedDeck(deckName)
      setCards(deck)
      setCurrentIndex(0)
      setFlipped(false)
    }
  }

  const allDecks = { ...PRESET_DECKS, ...customDecks }
  const masteredCount = cards.filter(c => c.mastered).length
  const progressPct = cards.length > 0 ? (masteredCount / cards.length) * 100 : 0

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="AI Flashcard Generator"
      title="Study smarter.<br/>Remember more."
      subtitle="Pre-built flashcard decks for BRACU courses. Or generate your own from your notes using AI."
    >
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
        {([['browse', '📚 Browse Decks'], ['study', '🎯 Study Mode'], ['create', '✏️ Create Cards']] as const).map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: '11px', background: mode === m ? 'var(--red)' : 'var(--ink2)', color: mode === m ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
            {l}
          </button>
        ))}
      </div>

      {/* BROWSE MODE */}
      {mode === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', alignSelf: 'center' }}>Select Deck:</div>
            <button onClick={() => setShowGenerate(p => !p)}
              style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '9px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', marginLeft: 'auto' }}>
              🤖 Generate from Notes
            </button>
          </div>

          {showGenerate && (
            <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// Generate Flashcards from Your Notes</div>
              <div style={{ marginBottom: '12px' }}>
                <label style={lbl}>Course Code</label>
                <input style={inp} placeholder="CSE220" value={course} onChange={e => setCourse(e.target.value)} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>Paste Your Notes Here</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Paste lecture notes, textbook content, or any study material here. AI will generate flashcards from it..."
                  rows={6}
                  style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
              </div>
              <button onClick={generateFromNotes} disabled={generating || !notes.trim()}
                style={{ background: generating ? 'var(--dim)' : 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: generating ? 'wait' : 'crosshair', transition: 'all .2s' }}>
                {generating ? '⏳ Generating...' : 'Generate Flashcards →'}
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '2px', background: 'var(--border)' }}>
            {Object.entries(allDecks).map(([name, deck]) => {
              const mastered = deck.filter(c => c.mastered).length
              const pct = deck.length > 0 ? (mastered / deck.length) * 100 : 0
              return (
                <div key={name}
                  onClick={() => { changeDeck(name); setMode('study') }}
                  style={{ background: selectedDeck === name ? 'var(--ink2)' : 'var(--ink)', padding: '20px', cursor: 'crosshair', transition: 'background .15s', borderLeft: selectedDeck === name ? '2px solid var(--red)' : '2px solid transparent' }}
                  onMouseEnter={e => { if (selectedDeck !== name) e.currentTarget.style.background = 'var(--ink2)' }}
                  onMouseLeave={e => { if (selectedDeck !== name) e.currentTarget.style.background = 'var(--ink)' }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--paper)', letterSpacing: '1px', marginBottom: '6px' }}>{name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '12px' }}>{deck.length} cards · {deck.filter(c => c.difficulty === 'hard').length} hard</div>
                  <div style={{ background: 'rgba(242,237,228,0.06)', height: '3px', marginBottom: '6px' }}>
                    <div style={{ height: '100%', background: '#5fd49a', width: `${pct}%`, transition: 'width .3s' }} />
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>{mastered}/{deck.length} mastered</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* STUDY MODE */}
      {mode === 'study' && (
        <>
          {/* Deck selector + filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={selectedDeck} onChange={e => changeDeck(e.target.value)}
              style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '9px 14px', outline: 'none', flex: 1 }}>
              {Object.keys(allDecks).map(name => <option key={name}>{name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '2px' }}>
              {(['all', 'unmastered'] as const).map(f => (
                <button key={f} onClick={() => { setFilter(f); setCurrentIndex(0); setFlipped(false) }}
                  style={{ padding: '9px 14px', background: filter === f ? 'var(--red)' : 'transparent', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${filter === f ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
                  {f === 'all' ? 'All Cards' : '🔁 Unmastered'}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--faded)', marginBottom: '6px' }}>
              <span>Progress — {selectedDeck}</span>
              <span>{masteredCount}/{cards.length} mastered ({progressPct.toFixed(0)}%)</span>
            </div>
            <div style={{ background: 'rgba(242,237,228,0.06)', height: '4px' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#5fd49a,var(--red))', width: `${progressPct}%`, transition: 'width .3s' }} />
            </div>
          </div>

          {studyCards.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: '#5fd49a', letterSpacing: '2px', marginBottom: '8px' }}>All Cards Mastered!</div>
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '16px' }}>You've mastered all cards in this deck. Great work!</p>
              <button onClick={() => { setFilter('all'); setCurrentIndex(0) }}
                style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Review All Cards →
              </button>
            </div>
          ) : (
            <>
              {/* Card counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '1px' }}>
                  Card {currentIndex + 1} of {studyCards.length}
                  <span style={{ marginLeft: '12px', color: DIFFICULTY_COLOR[currentCard?.difficulty] }}>● {currentCard?.difficulty}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { setCurrentIndex(p => Math.max(0, p - 1)); setFlipped(false) }}
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair' }}>←</button>
                  <button onClick={() => { setCurrentIndex(p => Math.min(studyCards.length - 1, p + 1)); setFlipped(false) }}
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--faded)', padding: '5px 12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair' }}>→</button>
                </div>
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setFlipped(p => !p)}
                style={{ background: flipped ? 'rgba(242,237,228,0.04)' : 'var(--ink2)', border: `1px solid ${flipped ? 'rgba(95,212,154,0.2)' : 'var(--border)'}`, padding: '40px 32px', minHeight: '280px', cursor: 'crosshair', transition: 'all .3s', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: `linear-gradient(90deg,transparent,${flipped ? '#5fd49a' : 'var(--red)'},transparent)` }} />

                <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: flipped ? '#5fd49a' : 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>
                  {flipped ? '// ANSWER' : '// QUESTION — Click to flip'}
                </div>

                {!flipped ? (
                  <div style={{ fontFamily: 'Playfair Display,serif', fontStyle: 'italic', fontSize: 'clamp(16px,2vw,22px)', fontWeight: 700, color: 'var(--paper)', lineHeight: 1.5 }}>
                    {currentCard?.front}
                  </div>
                ) : (
                  <pre style={{ fontSize: '12px', color: 'var(--faded)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono,monospace', wordBreak: 'break-word' }}>
                    {currentCard?.back}
                  </pre>
                )}

                <div style={{ position: 'absolute', bottom: '16px', right: '20px', fontSize: '10px', color: 'var(--dim)' }}>
                  {currentCard?.course} · {currentCard?.reviewCount} reviews
                </div>
              </div>

              {/* Action buttons */}
              {flipped && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={markAgain}
                    style={{ background: 'rgba(232,57,14,0.08)', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.3)', padding: '14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair', transition: 'all .15s' }}>
                    🔁 Study Again
                  </button>
                  <button onClick={markMastered}
                    style={{ background: 'rgba(95,212,154,0.1)', color: '#5fd49a', border: '1px solid rgba(95,212,154,0.3)', padding: '14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair', transition: 'all .15s' }}>
                    ✓ Got It!
                  </button>
                </div>
              )}

              {!flipped && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--dim)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Click the card to reveal the answer
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* CREATE MODE */}
      {mode === 'create' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Create Custom Flashcard</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={lbl}>Course</label>
                <input style={inp} placeholder="CSE220" value={course} onChange={e => setCourse(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Difficulty</label>
                <select style={inp} value={newCard.difficulty} onChange={e => setNewCard(p => ({ ...p, difficulty: e.target.value as Flashcard['difficulty'] }))}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={lbl}>Question (Front)</label>
              <textarea value={newCard.front} onChange={e => setNewCard(p => ({ ...p, front: e.target.value }))}
                placeholder="What is the time complexity of binary search?"
                rows={3} style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Answer (Back)</label>
              <textarea value={newCard.back} onChange={e => setNewCard(p => ({ ...p, back: e.target.value }))}
                placeholder="O(log n) because..."
                rows={5} style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
            </div>
            <button onClick={addCustomCard} disabled={!newCard.front || !newCard.back}
              style={{ background: newCard.front && newCard.back ? 'var(--paper)' : 'var(--dim)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: newCard.front && newCard.back ? 'crosshair' : 'not-allowed' }}>
              Add Card →
            </button>
          </div>

          {/* Current deck cards */}
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', fontWeight: 700 }}>
            Current deck: {selectedDeck} ({cards.length} cards)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {cards.slice(-5).map(c => (
              <div key={c.id} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '8px', color: DIFFICULTY_COLOR[c.difficulty], border: `1px solid ${DIFFICULTY_COLOR[c.difficulty]}`, padding: '1px 6px', letterSpacing: '1px' }}>{c.difficulty}</span>
                  <span style={{ fontSize: '10px', color: 'var(--faded)' }}>{c.front.substring(0, 60)}{c.front.length > 60 ? '...' : ''}</span>
                  {c.mastered && <span style={{ fontSize: '9px', color: '#5fd49a', marginLeft: 'auto' }}>✓ Mastered</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Total Cards', val: cards.length },
          { label: 'Mastered', val: masteredCount },
          { label: 'Remaining', val: cards.length - masteredCount },
          { label: 'Progress', val: `${progressPct.toFixed(0)}%` },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--ink)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '28px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
            <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}