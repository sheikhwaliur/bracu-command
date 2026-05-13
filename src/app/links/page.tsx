'use client'
import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'

const LINKS = [
  // Academic
  { category: 'Academic', name: 'USIS', desc: 'Course registration, grade sheet, seat availability', url: 'https://usis.bracu.ac.bd', icon: '🎓', tag: 'Must Have' },
  { category: 'Academic', name: 'BracU Blended', desc: 'LMS — assignments, slides, announcements', url: 'https://elearn.bracu.ac.bd', icon: '📚', tag: 'Must Have' },
  { category: 'Academic', name: 'G Suite / BRACU Mail', desc: 'Official BRACU student email (@g.bracu.ac.bd)', url: 'https://mail.google.com', icon: '📧', tag: 'Must Have' },
  { category: 'Academic', name: 'BRACU Library', desc: 'Library catalog, e-resources, IEEE, Springer', url: 'https://library.bracu.ac.bd', icon: '📖', tag: '' },
  { category: 'Academic', name: 'BRACU OBE Portal', desc: 'Outcome-based education, CLO/PLO tracking', url: 'https://obe.bracu.ac.bd', icon: '📊', tag: '' },
  { category: 'Academic', name: 'Google Scholar', desc: 'Academic papers, citations, research', url: 'https://scholar.google.com', icon: '🔬', tag: '' },

  // Registration & Admin
  { category: 'Registration & Admin', name: 'Pre-Registration', desc: 'Advance course registration before semester', url: 'https://usis.bracu.ac.bd', icon: '📝', tag: '' },
  { category: 'Registration & Admin', name: 'Advising Slip', desc: 'Download advising slip for registration', url: 'https://usis.bracu.ac.bd', icon: '🗒️', tag: '' },
  { category: 'Registration & Admin', name: 'Tuition Fee Payment', desc: 'Pay semester fees online via bKash or bank', url: 'https://usis.bracu.ac.bd', icon: '💳', tag: '' },
  { category: 'Registration & Admin', name: 'Exam Controller', desc: 'Exam schedule, hall ticket, result', url: 'https://bracu.ac.bd/academics/office-of-the-controller-of-examinations', icon: '📋', tag: '' },

  // Tools & Portals
  { category: 'Tools & Portals', name: 'PreConnect', desc: 'Seat status, class schedule, free labs, planner', url: 'https://preconnect.app', icon: '🔗', tag: 'Popular' },
  { category: 'Tools & Portals', name: 'USIS CDN (eniamza)', desc: 'Live USIS seat data API used by BRACU Command', url: 'https://usis-cdn.eniamza.com/connect.json', icon: '📡', tag: '' },
  { category: 'Tools & Portals', name: 'Turnitin', desc: 'Plagiarism checker — required for thesis/reports', url: 'https://www.turnitin.com', icon: '🛡️', tag: '' },
  { category: 'Tools & Portals', name: 'Overleaf', desc: 'LaTeX editor for thesis and research papers', url: 'https://overleaf.com', icon: '📄', tag: '' },
  { category: 'Tools & Portals', name: 'GitHub Student Pack', desc: 'Free dev tools with BRACU email', url: 'https://education.github.com/pack', icon: '🐙', tag: 'Free' },
  { category: 'Tools & Portals', name: 'JetBrains Student', desc: 'Free IDEs with BRACU email — IntelliJ, PyCharm', url: 'https://www.jetbrains.com/community/education', icon: '💻', tag: 'Free' },

  // Career
  { category: 'Career & Internship', name: 'BRACU Career Center', desc: 'Job postings, internships, career fairs', url: 'https://bracu.ac.bd/career-services', icon: '💼', tag: '' },
  { category: 'Career & Internship', name: 'LinkedIn', desc: 'Professional network — connect with BRACU alumni', url: 'https://linkedin.com', icon: '🤝', tag: '' },
  { category: 'Career & Internship', name: 'BD Jobs', desc: 'Bangladesh job portal — internships & full-time', url: 'https://bdjobs.com', icon: '🇧🇩', tag: '' },
  { category: 'Career & Internship', name: 'Prothom Alo Jobs', desc: 'Job listings from Prothom Alo', url: 'https://jobs.prothomalo.com', icon: '📰', tag: '' },

  // Emergency & Admin
  { category: 'Emergency & Contacts', name: 'BRACU Main Website', desc: 'Official university portal', url: 'https://bracu.ac.bd', icon: '🏛️', tag: '' },
  { category: 'Emergency & Contacts', name: 'IT Help Desk', desc: 'Tech support — email, USIS, network issues', url: 'mailto:ithelpdesk@bracu.ac.bd', icon: '🖥️', tag: '' },
  { category: 'Emergency & Contacts', name: 'Registrar Office', desc: 'Transcripts, certificates, documents', url: 'https://bracu.ac.bd/administration/office-of-the-registrar', icon: '🗂️', tag: '' },
  { category: 'Emergency & Contacts', name: 'Medical Center', desc: 'On-campus health services and appointments', url: 'https://bracu.ac.bd/campus-life/medical-center', icon: '🏥', tag: '' },
]

const CATEGORIES = [...new Set(LINKS.map(l => l.category))]

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  'Must Have': { bg: 'rgba(0,180,255,0.12)', color: 'var(--red)' },
  'Popular': { bg: 'rgba(95,212,154,0.12)', color: '#5fd49a' },
  'Free': { bg: 'rgba(0,212,255,0.12)', color: 'var(--bronze)' },
}

export default function LinksPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = LINKS.filter(l => {
    const matchCat = activeCategory === 'All' || l.category === activeCategory
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const groupedFiltered = CATEGORIES.map(cat => ({
    cat,
    links: filtered.filter(l => l.category === cat)
  })).filter(g => g.links.length > 0)

  const copyUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <PageLayout
      eyebrow="Useful Links"
      title="Every BRACU link.<br/>One place."
      subtitle="Academic portals, tools, career resources, emergency contacts — all the links you actually need."
    >
      <style>{`
        .link-card { background: var(--ink); border: 1px solid var(--border); padding: 14px 16px; transition: background .15s; cursor: pointer; display: block; width: 100%; text-align: left; }
        .link-card:hover { background: var(--ink2); }
        .link-card:active { background: var(--ink2); }
        @media(max-width: 640px) { .link-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Search */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            placeholder="Search links..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'crosshair', fontSize: '14px', padding: 0, fontFamily: 'IBM Plex Mono,monospace' }}>✕</button>
          )}
        </div>
      </div>

      {/* Category filter — horizontal scroll on mobile */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ flexShrink: 0, padding: '7px 14px', background: activeCategory === cat ? 'var(--red)' : 'transparent', color: activeCategory === cat ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${activeCategory === cat ? 'var(--red)' : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s', whiteSpace: 'nowrap' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ fontSize: '10px', color: 'var(--faded)', marginBottom: '16px', letterSpacing: '1px' }}>
        {filtered.length} links {search && `for "${search}"`}
      </div>

      {/* Links grouped by category */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: 'var(--ink2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '20px', color: 'var(--paper)', letterSpacing: '2px', marginBottom: '6px' }}>No Links Found</div>
          <p style={{ fontSize: '11px', color: 'var(--faded)' }}>Try a different search term</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {groupedFiltered.map(({ cat, links }) => (
            <div key={cat}>
              {/* Category header */}
              <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cat}
                <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'inline-block' }} />
                <span style={{ color: 'var(--red)' }}>{links.length}</span>
              </div>

              {/* Links grid */}
              <div className="link-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px' }}>
                {links.map(link => (
                  <div key={link.name} style={{ position: 'relative' }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-card"
                    >
                      {/* Top accent line */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--border)' }} />

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{link.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--paper)' }}>{link.name}</span>
                            {link.tag && (
                              <span style={{ fontSize: '8px', letterSpacing: '1px', padding: '2px 6px', background: TAG_COLORS[link.tag]?.bg || 'var(--ink2)', color: TAG_COLORS[link.tag]?.color || 'var(--faded)', textTransform: 'uppercase', flexShrink: 0 }}>
                                {link.tag}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--faded)', lineHeight: 1.6, marginBottom: '8px' }}>{link.desc}</div>
                          <div style={{ fontSize: '9px', color: 'var(--red)', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {link.url.replace('https://', '').replace('http://', '').replace('mailto:', '')}
                          </div>
                        </div>
                      </div>

                      {/* Open arrow */}
                      <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', color: 'var(--faded)' }}>↗</div>
                    </a>

                    {/* Copy button */}
                    <button
                      onClick={() => copyUrl(link.url, link.name)}
                      style={{ position: 'absolute', bottom: '12px', right: '12px', background: copied === link.name ? 'rgba(95,212,154,0.15)' : 'var(--ink2)', border: `1px solid ${copied === link.name ? 'rgba(95,212,154,0.4)' : 'var(--border)'}`, color: copied === link.name ? '#5fd49a' : 'var(--faded)', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', cursor: 'crosshair', fontFamily: 'IBM Plex Mono,monospace', transition: 'all .2s' }}>
                      {copied === link.name ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggest a link */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px', marginTop: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '8px', fontWeight: 700 }}>MISSING A LINK?</div>
        <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, marginBottom: '14px' }}>Know a useful BRACU resource that's not listed here? Let us know.</p>
        <a href="mailto:sheikhwaliur001@gmail.com?subject=Link Suggestion for BRACU Command"
          style={{ display: 'inline-block', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink)', background: 'var(--paper)', border: 'none', padding: '10px 24px', cursor: 'crosshair', textDecoration: 'none' }}>
          Suggest a Link →
        </a>
      </div>
    </PageLayout>
  )
}