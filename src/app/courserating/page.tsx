'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface CourseReview {
  id: string
  rating: number
  difficulty: number
  workload: string
  text: string
  grade: string
  semester: string
  recommend: boolean
}

interface Course {
  id: string
  code: string
  name: string
  dept: string
  credits: number
  reviews: CourseReview[]
  avgRating: number
  avgDifficulty: number
}

const INITIAL_COURSES: Course[] = [
  {
    id: '1', code: 'CSE220', name: 'Data Structures', dept: 'CSE', credits: 3,
    avgRating: 4.2, avgDifficulty: 3.8,
    reviews: [
      { id: '1', rating: 4, difficulty: 4, workload: 'Heavy', text: 'Very important course. Challenging but worth it. Past papers are essential.', grade: 'A-', semester: 'Fall 2024', recommend: true },
      { id: '2', rating: 5, difficulty: 4, workload: 'Heavy', text: 'Foundational for everything else. Do not skip this. Lab assignments are tough.', grade: 'A', semester: 'Spring 2024', recommend: true },
    ]
  },
  {
    id: '2', code: 'CSE221', name: 'Algorithms', dept: 'CSE', credits: 3,
    avgRating: 3.9, avgDifficulty: 4.2,
    reviews: [
      { id: '3', rating: 4, difficulty: 5, workload: 'Very Heavy', text: 'One of the hardest CSE courses. Dynamic programming section is brutal.', grade: 'B+', semester: 'Fall 2024', recommend: true },
      { id: '4', rating: 3, difficulty: 4, workload: 'Heavy', text: 'Depends a lot on which faculty you get. Choose carefully.', grade: 'B', semester: 'Spring 2023', recommend: false },
    ]
  },
  {
    id: '3', code: 'MAT215', name: 'Linear Algebra', dept: 'MAT', credits: 3,
    avgRating: 3.7, avgDifficulty: 3.5,
    reviews: [
      { id: '5', rating: 4, difficulty: 3, workload: 'Moderate', text: 'Surprisingly useful for ML. The exams are fair if you practice problems.', grade: 'A-', semester: 'Spring 2024', recommend: true },
      { id: '6', rating: 3, difficulty: 4, workload: 'Heavy', text: 'Abstract concepts take time. Give yourself extra study time.', grade: 'B+', semester: 'Fall 2023', recommend: true },
    ]
  },
  {
    id: '4', code: 'CSE341', name: 'Operating Systems', dept: 'CSE', credits: 3,
    avgRating: 4.0, avgDifficulty: 4.0,
    reviews: [
      { id: '7', rating: 4, difficulty: 4, workload: 'Heavy', text: 'Great content. Scheduling algorithms and memory management are exam favourites.', grade: 'A-', semester: 'Fall 2024', recommend: true },
    ]
  },
  {
    id: '5', code: 'CSE471', name: 'Computer Networks', dept: 'CSE', credits: 3,
    avgRating: 4.3, avgDifficulty: 3.6,
    reviews: [
      { id: '8', rating: 5, difficulty: 3, workload: 'Moderate', text: 'One of my favourite courses. Real world knowledge you actually use.', grade: 'A', semester: 'Spring 2024', recommend: true },
      { id: '9', rating: 4, difficulty: 4, workload: 'Heavy', text: 'TCP/IP stack takes time to understand. Wireshark labs are fun.', grade: 'A-', semester: 'Fall 2023', recommend: true },
    ]
  },
  {
    id: '6', code: 'CSE482', name: 'Machine Learning', dept: 'CSE', credits: 3,
    avgRating: 4.5, avgDifficulty: 3.9,
    reviews: [
      { id: '10', rating: 5, difficulty: 4, workload: 'Heavy', text: 'Best elective I took. Python skills and MAT215 knowledge are essential prereqs.', grade: 'A', semester: 'Spring 2025', recommend: true },
    ]
  },
  {
    id: '7', code: 'ENG101', name: 'English Composition', dept: 'ENG', credits: 3,
    avgRating: 3.4, avgDifficulty: 2.0,
    reviews: [
      { id: '11', rating: 3, difficulty: 2, workload: 'Light', text: 'Easy GPA booster if you can write well. Essays every week.', grade: 'A', semester: 'Spring 2022', recommend: true },
    ]
  },
  {
    id: '8', code: 'CSE400', name: 'Computer Ethics', dept: 'CSE', credits: 3,
    avgRating: 3.2, avgDifficulty: 1.8,
    reviews: [
      { id: '12', rating: 3, difficulty: 2, workload: 'Light', text: 'Interesting topics but mostly theoretical. Good for GPA. Attendance matters.', grade: 'A', semester: 'Fall 2024', recommend: true },
    ]
  },
]

const WORKLOADS = ['Light', 'Moderate', 'Heavy', 'Very Heavy']
const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
const SEMESTERS = ['Spring 2026', 'Fall 2025', 'Summer 2025', 'Spring 2025', 'Fall 2024', 'Summer 2024', 'Spring 2024', 'Fall 2023', 'Spring 2023']

function Stars({ rating, size = 16, interactive = false, onRate }: { rating: number; size?: number; interactive?: boolean; onRate?: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n}
          onClick={() => interactive && onRate && onRate(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{ fontSize: `${size}px`, color: n <= (hovered || Math.round(rating)) ? 'var(--red)' : '#3A3328', cursor: interactive ? 'crosshair' : 'default', transition: 'transform .1s', lineHeight: 1, display: 'inline-block' }}
          onMouseDown={e => interactive && (e.currentTarget.style.transform = 'scale(1.3)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function CourseRatingPage() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [sort, setSort] = useState<'rating' | 'difficulty' | 'alpha'>('rating')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [ratedIds, setRatedIds] = useState<Record<string, boolean>>({})
  const [review, setReview] = useState({ rating: 5, difficulty: 3, workload: 'Moderate', text: '', grade: 'A', semester: SEMESTERS[0], recommend: true })
  const [newCourse, setNewCourse] = useState({ code: '', name: '', dept: 'CSE', credits: 3 })

  useEffect(() => {
    const rated = localStorage.getItem('bracu_rated_courses')
    if (rated) setRatedIds(JSON.parse(rated))
  }, [])

  const submitReview = (courseId: string) => {
    if (!review.text.trim() || review.text.length < 10) return
    const newReview: CourseReview = { id: Date.now().toString(), ...review }
    const newRated = { ...ratedIds, [courseId]: true }
    setRatedIds(newRated)
    localStorage.setItem('bracu_rated_courses', JSON.stringify(newRated))
    setCourses(p => p.map(c => {
      if (c.id !== courseId) return c
      const newReviews = [...c.reviews, newReview]
      const avgRating = newReviews.reduce((a, r) => a + r.rating, 0) / newReviews.length
      const avgDifficulty = newReviews.reduce((a, r) => a + r.difficulty, 0) / newReviews.length
      const updated = { ...c, reviews: newReviews, avgRating: parseFloat(avgRating.toFixed(1)), avgDifficulty: parseFloat(avgDifficulty.toFixed(1)) }
      if (selectedCourse?.id === courseId) setSelectedCourse(updated)
      return updated
    }))
    setReview({ rating: 5, difficulty: 3, workload: 'Moderate', text: '', grade: 'A', semester: SEMESTERS[0], recommend: true })
    setShowReviewForm(false)
  }

  const addCourse = () => {
    if (!newCourse.code || !newCourse.name) return
    const course: Course = {
      id: Date.now().toString(),
      code: newCourse.code.toUpperCase(),
      name: newCourse.name,
      dept: newCourse.dept,
      credits: newCourse.credits,
      reviews: [],
      avgRating: 0,
      avgDifficulty: 0,
    }
    setCourses(p => [...p, course])
    setNewCourse({ code: '', name: '', dept: 'CSE', credits: 3 })
    setShowAddCourse(false)
  }

  const depts = ['All', ...Array.from(new Set(courses.map(c => c.dept)))]

  const filtered = courses
    .filter(c => dept === 'All' || c.dept === dept)
    .filter(c => !search || (c.code + c.name).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rating') return b.avgRating - a.avgRating
      if (sort === 'difficulty') return b.avgDifficulty - a.avgDifficulty
      return a.code.localeCompare(b.code)
    })

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Course Ratings"
      title="Rate courses.<br/>Help your juniors."
      subtitle="Honest ratings from students who actually took the course. Difficulty, workload, and what to expect."
    >
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none' }}
          placeholder="Search by course code or name..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 14px', outline: 'none' }}>
          <option value="rating">Highest Rated</option>
          <option value="difficulty">Hardest First</option>
          <option value="alpha">A → Z</option>
        </select>
        <button onClick={() => setShowAddCourse(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '10px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
          + Add Course
        </button>
      </div>

      {/* Dept filter */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {depts.map(d => (
          <button key={d} onClick={() => setDept(d)}
            style={{ padding: '6px 14px', background: dept === d ? 'var(--red)' : 'transparent', color: dept === d ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${dept === d ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {d}
          </button>
        ))}
      </div>

      {/* Add course form */}
      {showAddCourse && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: '16px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// Add Course</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 80px', gap: '12px', marginBottom: '14px' }}>
            <div><label style={lbl}>Code</label><input style={inp} placeholder="CSE471" value={newCourse.code} onChange={e => setNewCourse(p => ({ ...p, code: e.target.value }))} /></div>
            <div><label style={lbl}>Name</label><input style={inp} placeholder="Computer Networks" value={newCourse.name} onChange={e => setNewCourse(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label style={lbl}>Dept</label><input style={inp} placeholder="CSE" value={newCourse.dept} onChange={e => setNewCourse(p => ({ ...p, dept: e.target.value }))} /></div>
            <div><label style={lbl}>Credits</label>
              <select style={inp} value={newCourse.credits} onChange={e => setNewCourse(p => ({ ...p, credits: parseInt(e.target.value) }))}>
                {[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <button onClick={addCourse} style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '10px 24px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>Add →</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedCourse ? '1fr 1fr' : '1fr', gap: '2px', background: selectedCourse ? 'var(--border)' : 'transparent' }}>
        {/* Course list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filtered.map(c => (
            <div key={c.id}
              onClick={() => setSelectedCourse(selectedCourse?.id === c.id ? null : c)}
              style={{ background: selectedCourse?.id === c.id ? 'var(--ink2)' : 'var(--ink)', border: `1px solid ${selectedCourse?.id === c.id ? 'rgba(232,57,14,0.3)' : 'var(--border)'}`, padding: '16px 20px', cursor: 'crosshair', transition: 'all .15s', borderLeft: selectedCourse?.id === c.id ? '2px solid var(--red)' : '2px solid transparent' }}
              onMouseEnter={e => { if (selectedCourse?.id !== c.id) e.currentTarget.style.background = 'var(--ink2)' }}
              onMouseLeave={e => { if (selectedCourse?.id !== c.id) e.currentTarget.style.background = 'var(--ink)' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--red)', fontWeight: 700 }}>{c.code}</span>
                    <span style={{ fontSize: '9px', color: 'var(--dim)', border: '1px solid var(--border)', padding: '1px 6px', letterSpacing: '1px' }}>{c.credits}cr</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '6px' }}>{c.name}</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Stars rating={c.avgRating} size={13} />
                    <span style={{ fontSize: '10px', color: 'var(--faded)' }}>{c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'} ({c.reviews.length} reviews)</span>
                    <span style={{ fontSize: '9px', color: 'var(--bronze)', letterSpacing: '1px' }}>
                      {c.avgDifficulty > 0 ? `Difficulty: ${c.avgDifficulty.toFixed(1)}/5` : 'No ratings yet'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', flexShrink: 0 }}>
                  {c.reviews.filter(r => r.recommend).length}/{c.reviews.length} recommend
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
              No courses found.
            </div>
          )}
        </div>

        {/* Course detail panel */}
        {selectedCourse && (
          <div style={{ background: 'var(--ink)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--ink2)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-1px', left: '20px', right: '20px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--red)', fontWeight: 700, marginBottom: '4px' }}>{selectedCourse.code} · {selectedCourse.credits} credits</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '24px', color: 'var(--paper)', letterSpacing: '1px' }}>{selectedCourse.name}</div>
                </div>
                <button onClick={() => setSelectedCourse(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '18px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
              </div>

              {/* Avg stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '14px' }}>
                {[
                  { label: 'Rating', val: selectedCourse.avgRating > 0 ? selectedCourse.avgRating.toFixed(1) : '—' },
                  { label: 'Difficulty', val: selectedCourse.avgDifficulty > 0 ? `${selectedCourse.avgDifficulty.toFixed(1)}/5` : '—' },
                  { label: 'Recommend', val: `${selectedCourse.reviews.filter(r => r.recommend).length}/${selectedCourse.reviews.length}` },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', background: 'var(--ink)', border: '1px solid var(--border)', padding: '10px' }}>
                    <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)', letterSpacing: '1px' }}>{s.val}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', maxHeight: '400px' }}>
              {selectedCourse.reviews.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px' }}>
                  No reviews yet. Be the first!
                </div>
              )}
              {selectedCourse.reviews.map(r => (
                <div key={r.id} style={{ borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Stars rating={r.rating} size={13} />
                    <span style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>{r.semester}</span>
                    <span style={{ fontSize: '9px', color: r.grade.startsWith('A') ? '#5fd49a' : 'var(--bronze)', border: '1px solid var(--border)', padding: '1px 6px', letterSpacing: '1px' }}>Grade: {r.grade}</span>
                    <span style={{ fontSize: '9px', color: 'var(--faded)', border: '1px solid var(--border)', padding: '1px 6px' }}>{r.workload}</span>
                    {r.recommend && <span style={{ fontSize: '9px', color: '#5fd49a' }}>✓ Recommends</span>}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, fontStyle: 'italic' }}>" {r.text} "</p>
                </div>
              ))}
            </div>

            {/* Add review */}
            {!ratedIds[selectedCourse.id] ? (
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                {!showReviewForm ? (
                  <button onClick={() => setShowReviewForm(true)}
                    style={{ width: '100%', background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '12px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                    + Add Your Review
                  </button>
                ) : (
                  <div>
                    <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// Your Review</div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <label style={lbl}>Rating</label>
                        <Stars rating={review.rating} size={20} interactive onRate={n => setReview(p => ({ ...p, rating: n }))} />
                      </div>
                      <div>
                        <label style={lbl}>Difficulty (1-5)</label>
                        <Stars rating={review.difficulty} size={20} interactive onRate={n => setReview(p => ({ ...p, difficulty: n }))} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={lbl}>Workload</label>
                        <select style={inp} value={review.workload} onChange={e => setReview(p => ({ ...p, workload: e.target.value }))}>
                          {WORKLOADS.map(w => <option key={w}>{w}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Your Grade</label>
                        <select style={inp} value={review.grade} onChange={e => setReview(p => ({ ...p, grade: e.target.value }))}>
                          {GRADES.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Semester</label>
                        <select style={inp} value={review.semester} onChange={e => setReview(p => ({ ...p, semester: e.target.value }))}>
                          {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <textarea value={review.text} onChange={e => setReview(p => ({ ...p, text: e.target.value }))}
                      placeholder="Share your honest experience..."
                      rows={3}
                      style={{ ...inp, resize: 'none', lineHeight: 1.7, marginBottom: '10px' }} />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                      <label style={{ ...lbl, margin: 0 }}>Recommend?</label>
                      <button onClick={() => setReview(p => ({ ...p, recommend: !p.recommend }))}
                        style={{ background: review.recommend ? 'rgba(95,212,154,0.1)' : 'transparent', color: review.recommend ? '#5fd49a' : 'var(--faded)', border: `1px solid ${review.recommend ? 'rgba(95,212,154,0.3)' : 'var(--border)'}`, padding: '5px 14px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', cursor: 'crosshair', transition: 'all .15s' }}>
                        {review.recommend ? '✓ Yes' : 'No'}
                      </button>
                    </div>
                    <button onClick={() => submitReview(selectedCourse.id)}
                      style={{ width: '100%', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '11px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                      Submit Review →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', textAlign: 'center', fontSize: '10px', color: '#5fd49a' }}>
                ✓ You've already reviewed this course
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}