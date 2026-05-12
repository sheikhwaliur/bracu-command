'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'
import PageLayout from '@/components/layout/PageLayout'

interface StudyGroup {
  id: string
  course: string
  title: string
  description: string
  members: number
  maxMembers: number
  meetingType: 'online' | 'campus' | 'hybrid'
  meetingTime: string
  location: string
  contact: string
  tags: string[]
  createdBy: string
  joined?: boolean
}

const MEETING_COLOR: Record<string, string> = {
  online: '#5fd49a',
  campus: 'var(--red)',
  hybrid: 'var(--bronze)',
}

const MOCK_GROUPS: StudyGroup[] = [
  { id: '1', course: 'CSE471', title: 'Networks Exam Prep Group', description: 'Preparing for the final exam. Covering TCP/IP, routing protocols, and network security. Daily sessions this week.', members: 6, maxMembers: 8, meetingType: 'hybrid', meetingTime: 'Daily 8–10 PM', location: 'UB Library + Google Meet', contact: 'WhatsApp: Group link in chat', tags: ['Final prep', 'TCP/IP', 'Routing'], createdBy: '21***' },
  { id: '2', course: 'MAT215', title: 'Linear Algebra Study Circle', description: 'Weekly sessions on eigenvalues, matrix transformations, and vector spaces. All levels welcome. Seniors guide juniors.', members: 9, maxMembers: 12, meetingType: 'campus', meetingTime: 'Sat & Sun 2–4 PM', location: 'Room 4063, UB40', contact: 'DM on BRACU Command', tags: ['Eigenvalues', 'Matrices', 'Weekly'], createdBy: '20***' },
  { id: '3', course: 'CSE220', title: 'DSA Practice Group', description: 'Solving past papers and LeetCode problems together. Focus on sorting, trees, and graphs. Competitive programming vibe.', members: 11, maxMembers: 15, meetingType: 'online', meetingTime: 'Mon/Wed/Fri 9 PM', location: 'Discord Server', contact: 'discord.gg/bracudsa', tags: ['LeetCode', 'Algorithms', 'Past papers'], createdBy: '22***' },
  { id: '4', course: 'CSE341', title: 'OS Concepts Study Group', description: 'Going through process scheduling, memory management, and deadlocks together. Using Silberschatz textbook.', members: 5, maxMembers: 8, meetingType: 'campus', meetingTime: 'Tuesday 3–5 PM', location: 'CS Lab 2, UB30', contact: 'Contact via BRACU Command', tags: ['Scheduling', 'Memory', 'Deadlocks'], createdBy: '21***' },
  { id: '5', course: 'PHY111', title: 'Physics Lab Report Group', description: 'Helping each other write lab reports properly. Share templates, check each other\'s work before submission.', members: 7, maxMembers: 10, meetingType: 'online', meetingTime: 'Flexible / Before deadlines', location: 'WhatsApp + Notion', contact: 'WhatsApp group', tags: ['Lab reports', 'Templates', 'Review'], createdBy: '23***' },
  { id: '6', course: 'CSE482', title: 'ML Project Team', description: 'Working on semester project together. Using PyTorch. Looking for people with strong Python skills.', members: 3, maxMembers: 5, meetingType: 'hybrid', meetingTime: 'Weekends 11 AM–1 PM', location: 'CS Lounge + Zoom', contact: 'Reply to this post', tags: ['PyTorch', 'Project', 'Python'], createdBy: '20***' },
]

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>(MOCK_GROUPS)
  const [filter, setFilter] = useState<'all' | 'online' | 'campus' | 'hybrid'>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [joinedIds, setJoinedIds] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({
    course: '', title: '', description: '', maxMembers: 8,
    meetingType: 'hybrid' as StudyGroup['meetingType'],
    meetingTime: '', location: '', contact: '', tags: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('bracu_joined_groups')
    if (saved) setJoinedIds(JSON.parse(saved))
  
    const fetchGroups = async () => {
      const { data } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setGroups(p => [
          ...data.map((g: any) => ({
            id: g.id, course: g.course, title: g.title,
            description: g.description, members: g.members,
            maxMembers: g.max_members, meetingType: g.meeting_type,
            meetingTime: g.meeting_time, location: g.location,
            contact: g.contact, tags: g.tags || [],
            createdBy: 'Student',
          })),
          ...p,
        ])
      }
    }
    fetchGroups()
  }, [])

  const joinGroup = (id: string) => {
    if (joinedIds[id]) return
    const newJoined = { ...joinedIds, [id]: true }
    setJoinedIds(newJoined)
    localStorage.setItem('bracu_joined_groups', JSON.stringify(newJoined))
    setGroups(p => p.map(g => g.id === id ? { ...g, members: g.members + 1 } : g))
  }

  const leaveGroup = (id: string) => {
    const newJoined = { ...joinedIds }
    delete newJoined[id]
    setJoinedIds(newJoined)
    localStorage.setItem('bracu_joined_groups', JSON.stringify(newJoined))
    setGroups(p => p.map(g => g.id === id ? { ...g, members: Math.max(0, g.members - 1) } : g))
  }

  const createGroup = async () => {
    // Rate limit — max 2 groups per 10 minutes
    const { allowed, waitSeconds } = checkRateLimit({ key: 'studygroup', limitMs: 600000, maxAttempts: 2 })
    if (!allowed) {
      alert(`Please wait ${waitSeconds} seconds before creating another group.`)
      return
    }
    if (!form.course || !form.title || !form.description) return
    const { data, error } = await supabase.from('study_groups').insert({
      course: form.course.toUpperCase(),
      title: form.title,
      description: form.description,
      meeting_type: form.meetingType,
      meeting_time: form.meetingTime,
      location: form.location,
      contact: form.contact,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      max_members: form.maxMembers,
      members: 1,
    }).select().single()
    if (error) { console.error(error); return }
    const newGroup = {
      id: data.id, course: data.course, title: data.title,
      description: data.description, members: 1,
      maxMembers: data.max_members, meetingType: data.meeting_type,
      meetingTime: data.meeting_time, location: data.location,
      contact: data.contact, tags: data.tags || [],
      createdBy: 'You',
    }
    setGroups(p => [newGroup, ...p])
    const newJoined = { ...joinedIds, [data.id]: true }
    setJoinedIds(newJoined)
    localStorage.setItem('bracu_joined_groups', JSON.stringify(newJoined))
    setForm({ course: '', title: '', description: '', maxMembers: 8, meetingType: 'hybrid', meetingTime: '', location: '', contact: '', tags: '' })
    setShowCreate(false)
  }

  const filtered = groups
    .filter(g => filter === 'all' || g.meetingType === filter)
    .filter(g => !search || (g.course + g.title + g.description + g.tags.join(' ')).toLowerCase().includes(search.toLowerCase()))

  const inp: React.CSSProperties = { background: 'var(--ink)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '9px 12px', outline: 'none', width: '100%' }
  const lbl: React.CSSProperties = { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', display: 'block', marginBottom: '6px', fontWeight: 700 }

  return (
    <PageLayout
      eyebrow="Study Group Finder"
      title="Find your<br/>study crew."
      subtitle="Find students taking the same courses. Form study groups, share resources, and prepare together."
    >
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: '200px', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none' }}
          placeholder="Search by course, topic, or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['all', 'online', 'campus', 'hybrid'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '9px 14px', background: filter === f ? (MEETING_COLOR[f] || 'var(--red)') : 'transparent', color: filter === f ? 'var(--paper)' : 'var(--faded)', border: `1px solid ${filter === f ? (MEETING_COLOR[f] || 'var(--red)') : 'var(--border)'}`, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
              {f === 'all' ? 'All' : f === 'online' ? '💻 Online' : f === 'campus' ? '🏫 Campus' : '🔀 Hybrid'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(p => !p)}
          style={{ background: 'var(--red)', color: 'var(--paper)', border: 'none', padding: '9px 20px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair' }}>
          + Create Group
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '24px', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-1px', left: '30px', right: '30px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
          <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '16px', fontWeight: 700 }}>// Create Study Group</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Course Code</label>
              <input style={inp} placeholder="CSE471" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Group Title</label>
              <input style={inp} placeholder="Networks Final Exam Prep" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What will you study? Who is this for? Any requirements?"
              rows={3}
              style={{ ...inp, resize: 'none', lineHeight: 1.7 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Meeting Type</label>
              <select style={inp} value={form.meetingType} onChange={e => setForm(p => ({ ...p, meetingType: e.target.value as any }))}>
                <option value="online">💻 Online</option>
                <option value="campus">🏫 Campus</option>
                <option value="hybrid">🔀 Hybrid</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Max Members</label>
              <select style={inp} value={form.maxMembers} onChange={e => setForm(p => ({ ...p, maxMembers: parseInt(e.target.value) }))}>
                {[4, 5, 6, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Meeting Time</label>
              <input style={inp} placeholder="Daily 8–10 PM" value={form.meetingTime} onChange={e => setForm(p => ({ ...p, meetingTime: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Location / Link</label>
              <input style={inp} placeholder="UB Library / Discord" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Contact / How to Join</label>
              <input style={inp} placeholder="WhatsApp group, Discord, etc." value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Tags (comma separated)</label>
              <input style={inp} placeholder="Final prep, Weekly, Python" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>
          <button onClick={createGroup}
            style={{ background: 'var(--paper)', color: 'var(--ink)', border: 'none', padding: '12px 28px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, cursor: 'crosshair' }}>
            Create Group →
          </button>
        </div>
      )}

      {/* Groups grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', background: 'var(--border)' }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: 'span 2', padding: '48px', textAlign: 'center', color: 'var(--faded)', fontSize: '11px', background: 'var(--ink2)', letterSpacing: '1px' }}>
            No study groups found. Create the first one!
          </div>
        )}
        {filtered.map(g => {
          const full = g.members >= g.maxMembers
          const joined = joinedIds[g.id]
          const fillPct = (g.members / g.maxMembers) * 100

          return (
            <div key={g.id}
              style={{ background: 'var(--ink)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>

              {/* Header */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(232,57,14,0.3)', padding: '3px 8px', flexShrink: 0, marginTop: '2px' }}>{g.course}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)', marginBottom: '3px', lineHeight: 1.3 }}>{g.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: MEETING_COLOR[g.meetingType], border: `1px solid ${MEETING_COLOR[g.meetingType]}`, padding: '2px 7px', opacity: .8 }}>
                      {g.meetingType === 'online' ? '💻' : g.meetingType === 'campus' ? '🏫' : '🔀'} {g.meetingType}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--faded)' }}>by {g.createdBy}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '11px', color: 'var(--faded)', lineHeight: 1.8, letterSpacing: '.2px' }}>{g.description}</p>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {g.meetingTime && (
                  <div style={{ fontSize: '10px', color: 'var(--faded)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--dim)', width: '60px', flexShrink: 0 }}>When:</span>
                    <span>{g.meetingTime}</span>
                  </div>
                )}
                {g.location && (
                  <div style={{ fontSize: '10px', color: 'var(--faded)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--dim)', width: '60px', flexShrink: 0 }}>Where:</span>
                    <span>{g.location}</span>
                  </div>
                )}
                {g.contact && (
                  <div style={{ fontSize: '10px', color: 'var(--bronze)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--dim)', width: '60px', flexShrink: 0 }}>Contact:</span>
                    <span>{g.contact}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {g.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {g.tags.map((t, i) => (
                    <span key={i} style={{ fontSize: '9px', letterSpacing: '1px', border: '1px solid var(--border)', padding: '2px 8px', color: 'var(--faded)' }}>{t}</span>
                  ))}
                </div>
              )}

              {/* Members progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--faded)', marginBottom: '6px' }}>
                  <span>{g.members}/{g.maxMembers} members</span>
                  <span style={{ color: full ? 'var(--red)' : '#5fd49a' }}>{full ? 'Full' : `${g.maxMembers - g.members} spots left`}</span>
                </div>
                <div style={{ background: 'rgba(242,237,228,0.06)', height: '3px' }}>
                  <div style={{ height: '100%', background: full ? 'var(--red)' : '#5fd49a', width: `${fillPct}%`, transition: 'width .3s' }} />
                </div>
              </div>

              {/* Join/Leave button */}
              <button
                onClick={() => joined ? leaveGroup(g.id) : joinGroup(g.id)}
                disabled={full && !joined}
                style={{ background: joined ? 'rgba(95,212,154,0.1)' : full ? 'var(--dim)' : 'var(--red)', color: joined ? '#5fd49a' : 'var(--paper)', border: `1px solid ${joined ? 'rgba(95,212,154,0.3)' : 'transparent'}`, padding: '10px', fontFamily: 'IBM Plex Mono,monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', cursor: full && !joined ? 'not-allowed' : 'crosshair', transition: 'all .15s', fontWeight: 700 }}>
                {joined ? '✓ Joined — Leave Group' : full ? 'Group Full' : 'Join Group →'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)', marginTop: '24px' }}>
        {[
          { label: 'Active Groups', val: groups.length },
          { label: 'Total Members', val: groups.reduce((a, g) => a + g.members, 0) },
          { label: 'You Joined', val: Object.keys(joinedIds).length },
          { label: 'Spots Available', val: groups.reduce((a, g) => a + Math.max(0, g.maxMembers - g.members), 0) },
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