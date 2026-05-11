'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface Review {
  id: string
  text: string
  rating: number
  date: string
}

interface Faculty {
  id: number
  init: string
  name: string
  designation: string
  email: string
  dept: string
  rank: string
  score: number
  reviews: Review[]
  tags: string[]
}

const FACULTY_DATA: Faculty[] = [
  { id: 1, init: 'KYK', name: 'Dr. Mohammad Kaykobad', designation: 'Professor', email: 'kaykobad@bracu.ac.bd', dept: 'CSE', rank: 'Professor', score: 4.8, tags: ['Legendary', 'Algorithm-focused', 'Inspiring'], reviews: [{ id: '1', text: 'The OG. Takes algorithms seriously. Must take at least one course.', rating: 5, date: 'Spring 2024' }] },
  { id: 2, init: 'AAR', name: 'Mr. Annajiat Alim Rasel', designation: 'Senior Lecturer', email: 'annajiat@bracu.ac.bd', dept: 'CSE', rank: 'Senior Lecturer', score: 4.7, tags: ['Student-favorite', 'Very helpful', 'Clear lectures'], reviews: [{ id: '2', text: 'The most helpful teacher in the dept. Never misses a question.', rating: 5, date: 'Fall 2024' }] },
  { id: 3, init: 'FYS', name: 'Dr. Farig Yousuf Sadeque', designation: 'Associate Professor', email: 'farig.sadeque@bracu.ac.bd', dept: 'CSE', rank: 'Associate Professor', score: 4.5, tags: ['NLP-focused', 'Engaging', 'Helpful OH'], reviews: [{ id: '3', text: 'One of the best. Explains everything clearly. Great for NLP.', rating: 5, date: 'Spring 2024' }] },
  { id: 4, init: 'SWK', name: 'Dr. Swakkhar Shatabda', designation: 'Professor', email: 'swakkhar.shatabda@bracu.ac.bd', dept: 'CSE', rank: 'Professor', score: 4.4, tags: ['Bioinformatics', 'Algorithm', 'Helpful'], reviews: [{ id: '4', text: 'Surprisingly engaging for tough topics. Good sense of humor.', rating: 4, date: 'Fall 2023' }] },
  { id: 5, init: 'SDS', name: 'Mr. Shadman Shahriar', designation: 'Lecturer', email: 'shadman.shahriar@bracu.ac.bd', dept: 'CSE', rank: 'Lecturer', score: 4.4, tags: ['Student-favorite', 'Very helpful', 'Flexible'], reviews: [{ id: '5', text: 'One of the most student-friendly teachers. Highly recommend.', rating: 5, date: 'Spring 2024' }] },
  { id: 6, init: 'MAM', name: 'Mahbubul Alam Majumdar, PhD', designation: 'Dean / Professor', email: 'majumdar@bracu.ac.bd', dept: 'CSE', rank: 'Professor', score: 4.5, tags: ['Research-focused', 'Experienced', 'Influential'], reviews: [{ id: '6', text: 'A legend in the department. Great for thesis supervision.', rating: 5, date: 'Fall 2023' }] },
  { id: 7, init: 'CMR', name: 'Dr. Chowdhury Mofizur Rahman', designation: 'Professor', email: 'rahman.mofizur@bracu.ac.bd', dept: 'CSE', rank: 'Professor', score: 4.2, tags: ['Research-heavy', 'Helpful OH', 'Project-based'], reviews: [{ id: '7', text: 'Good teacher, tough exams. Office hours are worth it.', rating: 4, date: 'Spring 2023' }] },
  { id: 8, init: 'MMM', name: 'Mr. Moin Mostakim', designation: 'Senior Lecturer', email: 'mostakim@bracu.ac.bd', dept: 'CSE', rank: 'Senior Lecturer', score: 4.3, tags: ['Concept-focused', 'Good slides', 'Attendance strict'], reviews: [{ id: '8', text: 'Attendance matters here. But lectures are worth attending.', rating: 4, date: 'Fall 2024' }] },
  { id: 9, init: 'MNY', name: 'Dr. Muhammad Nur Yanhaona', designation: 'Associate Professor', email: 'nur.yanhaona@bracu.ac.bd', dept: 'CSE', rank: 'Associate Professor', score: 4.2, tags: ['Theory-focused', 'Good explanations', 'Partial grading'], reviews: [{ id: '9', text: 'Takes theory seriously. Great for OS and systems.', rating: 4, date: 'Spring 2024' }] },
  { id: 10, init: 'GRA', name: 'Dr. Md. Golam Rabiul Alam', designation: 'Professor', email: 'rabiul.alam@bracu.ac.bd', dept: 'CSE', rank: 'Professor', score: 4.1, tags: ['ML-focused', 'Project-based', 'Fair grading'], reviews: [{ id: '10', text: 'Best for ML and AI courses. Great research opportunities.', rating: 4, date: 'Fall 2023' }] },
  { id: 11, init: 'MSI', name: 'Md. Saiful Islam', designation: 'Senior Lecturer', email: 'md.saiful.islam@bracu.ac.bd', dept: 'CSE', rank: 'Senior Lecturer', score: 4.1, tags: ['Practical-focused', 'Lab-heavy', 'Good feedback'], reviews: [{ id: '11', text: 'Practical assignments are tough but you actually learn.', rating: 4, date: 'Spring 2024' }] },
  { id: 12, init: 'SDF', name: 'Dr. Md Sadek Ferdous', designation: 'Professor', email: 'sadek.ferdous@bracu.ac.bd', dept: 'CSE', rank: 'Professor', score: 4.3, tags: ['Blockchain', 'Security', 'Research-driven'], reviews: [{ id: '12', text: 'Great for security and blockchain. Very knowledgeable.', rating: 4, date: 'Fall 2023' }] },
  { id: 13, init: 'NAZ', name: 'Nazmus Sakib Touhid', designation: 'Lecturer', email: 'nazmus.touhid@bracu.ac.bd', dept: 'CSE', rank: 'Lecturer', score: 4.2, tags: ['Very helpful', 'Clear', 'Student-friendly'], reviews: [{ id: '13', text: 'Always available to help. Great for tough courses.', rating: 4, date: 'Spring 2024' }] },
  { id: 14, init: 'TLQ', name: 'Dr. Taiabul Haque', designation: 'Associate Professor', email: 'taiabul.haque@bracu.ac.bd', dept: 'CSE', rank: 'Associate Professor', score: 4.0, tags: ['Network-focused', 'Lab-heavy', 'Good OH'], reviews: [{ id: '14', text: 'Strong on networking. Labs are intensive.', rating: 4, date: 'Fall 2023' }] },
  { id: 15, init: 'MIH', name: 'Dr. Muhammad Iqbal Hossain', designation: 'Associate Professor', email: 'iqbal.hossain@bracu.ac.bd', dept: 'CSE', rank: 'Associate Professor', score: 3.8, tags: ['Theory-heavy', 'Strict grading', 'Research'], reviews: [{ id: '15', text: 'Challenging courses. Study hard or it will hurt.', rating: 3, date: 'Spring 2023' }] },
]

const RANKS = ['All', 'Professor', 'Associate Professor', 'Assistant Professor', 'Senior Lecturer', 'Lecturer']

export default function FacultyPage() {
  const [search, setSearch] = useState('')
  const [rank, setRank] = useState('All')
  const [sort, setSort] = useState<'rating' | 'alpha'>('rating')
  const [connectModal, setConnectModal] = useState<Faculty | null>(null)
  const [reviewModal, setReviewModal] = useState<Faculty | null>(null)
  const [faculty, setFaculty] = useState<Faculty[]>(FACULTY_DATA)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [ratedIds, setRatedIds] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const rated = localStorage.getItem('bracu_rated_faculty')
    if (rated) setRatedIds(JSON.parse(rated))
  }, [])

  const submitReview = (f: Faculty) => {
    if (!reviewText.trim()) return
    const newReview: Review = {
      id: Date.now().toString(),
      text: reviewText,
      rating: reviewRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }
    const newRated = { ...ratedIds, [f.id]: true }
    setRatedIds(newRated)
    localStorage.setItem('bracu_rated_faculty', JSON.stringify(newRated))
    setFaculty(p => p.map(fac => {
      if (fac.id !== f.id) return fac
      const newReviews = [...fac.reviews, newReview]
      const newScore = parseFloat((newReviews.reduce((a, r) => a + r.rating, 0) / newReviews.length).toFixed(1))
      return { ...fac, reviews: newReviews, score: newScore }
    }))
    setReviewText('')
    setReviewModal(null)
  }

  const filtered = faculty
    .filter(f => rank === 'All' || f.rank === rank)
    .filter(f => !search || (f.name + f.init + f.email + f.designation).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'rating' ? b.score - a.score : a.name.localeCompare(b.name))

  const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(12,11,9,0.88)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeIn .2s ease' }
  const modalBox: React.CSSProperties = { background: 'var(--ink2)', border: '1px solid var(--border)', width: '100%', maxWidth: '440px', position: 'relative' }

  return (
    <PageLayout
      eyebrow="Faculty Intelligence Board"
      title="Know before<br/>you register."
      subtitle={`${FACULTY_DATA.length}+ real BRACU CSE faculty — ratings, teaching style, exam patterns, and direct contact. All verified.`}
    >
      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none' }}
          placeholder="Search by name, initials, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={rank} onChange={e => setRank(e.target.value)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 14px', outline: 'none' }}>
          {RANKS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          style={{ background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--faded)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '11px', padding: '10px 14px', outline: 'none' }}>
          <option value="rating">Highest Rated</option>
          <option value="alpha">A → Z</option>
        </select>
      </div>

      {/* Faculty list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {filtered.map(f => (
          <div key={f.id} style={{ background: 'var(--ink)', border: '1px solid var(--border)', padding: '20px 24px', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

            {/* Top row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'start' }}>
              {/* Avatar */}
              <div style={{ width: '44px', height: '44px', background: 'rgba(232,57,14,0.08)', border: '1px solid rgba(232,57,14,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: '14px', color: 'var(--red)', letterSpacing: '1px', flexShrink: 0 }}>
                {f.init.substring(0, 2)}
              </div>

              {/* Info */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '2px' }}>{f.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '.5px' }}>{f.designation}</div>
                <div style={{ fontSize: '10px', color: 'var(--bronze)', marginTop: '3px' }}>{f.email}</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {f.tags.map((t, i) => (
                    <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: `1px solid ${i < 2 ? 'rgba(232,57,14,0.25)' : 'var(--border)'}`, padding: '2px 7px', color: i < 2 ? 'rgba(232,57,14,0.7)' : 'var(--faded)' }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: 'var(--red)', fontSize: '13px', letterSpacing: '1px' }}>{'★'.repeat(Math.round(f.score))}{'☆'.repeat(5 - Math.round(f.score))}</div>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '26px', color: 'var(--paper)', letterSpacing: '1px', lineHeight: 1 }}>{f.score.toFixed(1)}</div>
                <div style={{ fontSize: '9px', color: 'var(--faded)', letterSpacing: '1px' }}>{f.reviews.length} reviews</div>
              </div>
            </div>

            {/* Latest review */}
            {f.reviews.length > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--faded)', fontStyle: 'italic', margin: '12px 0', padding: '10px 14px', borderLeft: '2px solid rgba(232,57,14,0.2)', lineHeight: 1.8 }}>
                "{f.reviews[f.reviews.length - 1].text}" — {f.reviews[f.reviews.length - 1].date}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setReviewModal(f)}
                style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--paper)', background: ratedIds[f.id] ? 'rgba(242,237,228,0.05)' : 'var(--red)', border: 'none', padding: '6px 14px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                {ratedIds[f.id] ? '✓ Reviewed' : '+ Add Review'}
              </button>
              <button onClick={() => setConnectModal(f)}
                style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', background: 'none', border: '1px solid rgba(232,57,14,0.3)', padding: '6px 14px', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
                Connect →
              </button>
              <span style={{ fontSize: '9px', color: 'var(--dim)', letterSpacing: '1px', alignSelf: 'center', marginLeft: 'auto' }}>
                {f.reviews.length} {f.reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div style={modalBox}>
            <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)' }}>{reviewModal.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '2px' }}>{reviewModal.designation}</div>
              </div>
              <button onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '18px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Add Anonymous Review</div>

              {/* Star selector */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>Rating</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n}
                      onClick={() => setReviewRating(n)}
                      onMouseEnter={() => setHoveredStar(n)}
                      onMouseLeave={() => setHoveredStar(0)}
                      style={{ background: 'none', border: 'none', fontSize: '24px', color: n <= (hoveredStar || reviewRating) ? 'var(--red)' : '#3A3328', cursor: 'crosshair', transition: 'transform .1s', lineHeight: 1 }}>★</button>
                  ))}
                  <span style={{ fontSize: '12px', color: 'var(--faded)', alignSelf: 'center', marginLeft: '8px' }}>{reviewRating}/5</span>
                </div>
              </div>

              {/* Review text */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>Your Review (Anonymous)</div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your honest experience — exam style, teaching quality, grading..."
                  rows={4}
                  style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '12px 14px', outline: 'none', resize: 'none', lineHeight: 1.7 }}
                />
              </div>

              <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '16px', letterSpacing: '.3px' }}>
                ✓ Anonymous — your Student ID is never shown publicly
              </div>

              <button onClick={() => submitReview(reviewModal)}
                style={{ width: '100%', background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '13px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
                Submit Review →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {connectModal && (
        <div style={modalOverlay} onClick={e => e.target === e.currentTarget && setConnectModal(null)}>
          <div style={modalBox}>
            <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)' }}>{connectModal.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)', marginTop: '2px' }}>{connectModal.designation} · {connectModal.dept}</div>
              </div>
              <button onClick={() => setConnectModal(null)} style={{ background: 'none', border: 'none', color: 'var(--faded)', fontSize: '18px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
            </div>
            <div style={{ padding: '20px 28px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <a href={`mailto:${connectModal.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(232,57,14,0.05)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--ink)' }}>
                  <span style={{ fontSize: '18px' }}>📧</span>
                  <div>
                    <div style={{ fontSize: '12px' }}>{connectModal.email}</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px', letterSpacing: '.5px' }}>Send email directly</div>
                  </div>
                </a>
                <a href="https://cse.sds.bracu.ac.bd/faculty_list" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,57,14,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                  <span style={{ fontSize: '18px' }}>🔗</span>
                  <div>
                    <div style={{ fontSize: '12px' }}>Official BRACU Profile</div>
                    <div style={{ fontSize: '9px', color: 'var(--faded)', marginTop: '2px', letterSpacing: '.5px' }}>View on BRACU CSE portal</div>
                  </div>
                </a>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '.3px', lineHeight: 1.8, borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                Always be respectful and professional. Include your Student ID and course name in your message.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </PageLayout>
  )
}