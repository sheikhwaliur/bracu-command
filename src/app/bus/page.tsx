'use client'
import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'

interface BusRoute {
  id: string
  name: string
  direction: 'to_bracu' | 'from_bracu'
  stops: { place: string; time: string }[]
  days: string
  type: 'ac' | 'non-ac'
  remarks?: string
}

const ROUTES: BusRoute[] = [
  {
    id: '1', name: 'Route A — Mirpur', direction: 'to_bracu', type: 'non-ac', days: 'Sun–Thu',
    stops: [
      { place: 'Mirpur-1 (Kalyanpur)', time: '7:00 AM' },
      { place: 'Mirpur-10 Circle', time: '7:15 AM' },
      { place: 'Agargaon', time: '7:30 AM' },
      { place: 'Bijoy Sarani', time: '7:45 AM' },
      { place: 'Mohakhali', time: '8:00 AM' },
      { place: 'BRACU Main Gate', time: '8:20 AM' },
    ]
  },
  {
    id: '2', name: 'Route B — Dhanmondi', direction: 'to_bracu', type: 'ac', days: 'Sun–Thu',
    stops: [
      { place: 'Dhanmondi-27', time: '7:10 AM' },
      { place: 'Dhanmondi-15', time: '7:20 AM' },
      { place: 'Science Lab', time: '7:30 AM' },
      { place: 'Nilkhet', time: '7:40 AM' },
      { place: 'Shahbagh', time: '7:50 AM' },
      { place: 'Farmgate', time: '8:05 AM' },
      { place: 'BRACU Main Gate', time: '8:30 AM' },
    ]
  },
  {
    id: '3', name: 'Route C — Uttara', direction: 'to_bracu', type: 'non-ac', days: 'Sun–Thu',
    stops: [
      { place: 'Uttara Sector-7', time: '6:45 AM' },
      { place: 'Uttara Sector-3', time: '6:55 AM' },
      { place: 'Airport Road', time: '7:10 AM' },
      { place: 'Khilkhet', time: '7:25 AM' },
      { place: 'Kuril Bishwa Road', time: '7:40 AM' },
      { place: 'BRACU Main Gate', time: '8:10 AM' },
    ]
  },
  {
    id: '4', name: 'Route D — Bashundhara', direction: 'to_bracu', type: 'non-ac', days: 'Sun–Thu',
    stops: [
      { place: 'Bashundhara Gate', time: '7:30 AM' },
      { place: 'Notun Bazar', time: '7:40 AM' },
      { place: 'Merul Badda', time: '7:50 AM' },
      { place: 'BRACU Main Gate', time: '8:05 AM' },
    ],
    remarks: 'Closest route for Bashundhara residents'
  },
  {
    id: '5', name: 'Route E — Mohammadpur', direction: 'to_bracu', type: 'non-ac', days: 'Sun–Thu',
    stops: [
      { place: 'Mohammadpur Bus Stand', time: '7:00 AM' },
      { place: 'Shyamoli', time: '7:15 AM' },
      { place: 'Adabar', time: '7:25 AM' },
      { place: 'Kalabagan', time: '7:40 AM' },
      { place: 'Panthapath', time: '7:50 AM' },
      { place: 'Karwan Bazar', time: '8:05 AM' },
      { place: 'BRACU Main Gate', time: '8:30 AM' },
    ]
  },
  {
    id: '6', name: 'Route A — Mirpur (Return)', direction: 'from_bracu', type: 'non-ac', days: 'Sun–Thu',
    stops: [
      { place: 'BRACU Main Gate', time: '2:00 PM' },
      { place: 'Mohakhali', time: '2:20 PM' },
      { place: 'Bijoy Sarani', time: '2:35 PM' },
      { place: 'Agargaon', time: '2:50 PM' },
      { place: 'Mirpur-10 Circle', time: '3:05 PM' },
      { place: 'Mirpur-1 (Kalyanpur)', time: '3:20 PM' },
    ]
  },
  {
    id: '7', name: 'Route B — Dhanmondi (Return)', direction: 'from_bracu', type: 'ac', days: 'Sun–Thu',
    stops: [
      { place: 'BRACU Main Gate', time: '2:00 PM' },
      { place: 'Farmgate', time: '2:25 PM' },
      { place: 'Shahbagh', time: '2:40 PM' },
      { place: 'Nilkhet', time: '2:50 PM' },
      { place: 'Science Lab', time: '3:00 PM' },
      { place: 'Dhanmondi-15', time: '3:10 PM' },
      { place: 'Dhanmondi-27', time: '3:20 PM' },
    ]
  },
  {
    id: '8', name: 'Route C — Uttara (Return)', direction: 'from_bracu', type: 'non-ac', days: 'Sun–Thu',
    stops: [
      { place: 'BRACU Main Gate', time: '2:00 PM' },
      { place: 'Kuril Bishwa Road', time: '2:30 PM' },
      { place: 'Khilkhet', time: '2:45 PM' },
      { place: 'Airport Road', time: '3:00 PM' },
      { place: 'Uttara Sector-3', time: '3:15 PM' },
      { place: 'Uttara Sector-7', time: '3:25 PM' },
    ]
  },
]

const EVENING_TRIPS = [
  { route: 'All Routes', time: '5:00 PM', note: 'After late classes' },
  { route: 'Route A, B, C', time: '7:00 PM', note: 'Night service (limited)' },
]

const TIPS = [
  'Buses leave exactly on time — arrive 5 minutes early.',
  'AC buses require separate payment — check with driver.',
  'Friday and Saturday: No regular service. Emergency transport available.',
  'Bus schedule may change during exam periods — check notice board.',
  'Seat availability is first come first serve — no reservations.',
  'Contact Transport Office: transport@bracu.ac.bd for queries.',
]

export default function BusPage() {
  const [direction, setDirection] = useState<'to_bracu' | 'from_bracu'>('to_bracu')
  const [selected, setSelected] = useState<BusRoute | null>(null)
  const [search, setSearch] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [])

  const getNextBus = (route: BusRoute) => {
    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    for (const stop of route.stops) {
      const [time, period] = stop.time.split(' ')
      const [h, m] = time.split(':').map(Number)
      let hours = h
      if (period === 'PM' && h !== 12) hours += 12
      if (period === 'AM' && h === 12) hours = 0
      const stopMins = hours * 60 + m
      if (stopMins > nowMins) {
        const diff = stopMins - nowMins
        if (diff < 60) return `in ${diff} min`
        return `in ${Math.floor(diff / 60)}h ${diff % 60}m`
      }
    }
    return 'No more today'
  }

  const filtered = ROUTES
    .filter(r => r.direction === direction)
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.stops.some(s => s.place.toLowerCase().includes(search.toLowerCase())))

  return (
    <PageLayout
      eyebrow="Bus Schedule"
      title="Never miss<br/>your bus."
      subtitle="All BRACU bus routes, timings, and stops. Live clock to know when your next bus leaves."
    >
      {/* Live clock */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '16px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-1px', left: '40px', right: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--red),transparent)' }} />
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '4px' }}>Current Time</div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '36px', color: 'var(--red)', letterSpacing: '3px', lineHeight: 1 }}>{currentTime}</div>
        </div>
        <div style={{ flex: 1, fontSize: '11px', color: 'var(--faded)', lineHeight: 1.9 }}>
          Operating days: <span style={{ color: 'var(--paper)' }}>Sunday – Thursday</span><br />
          Morning departures: <span style={{ color: 'var(--paper)' }}>6:45 AM – 8:30 AM</span><br />
          Return trips: <span style={{ color: 'var(--paper)' }}>2:00 PM | 5:00 PM | 7:00 PM</span>
        </div>
      </div>

      {/* Direction toggle */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
        {([['to_bracu', '🏫 To BRACU'], ['from_bracu', '🏠 From BRACU']] as const).map(([d, l]) => (
          <button key={d} onClick={() => { setDirection(d); setSelected(null) }}
            style={{ flex: 1, padding: '12px', background: direction === d ? 'var(--red)' : 'var(--ink2)', color: direction === d ? 'var(--paper)' : 'var(--faded)', border: 'none', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'IBM Plex Mono,monospace', cursor: 'crosshair', transition: 'all .15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        style={{ width: '100%', background: 'var(--ink2)', border: '1px solid var(--border)', color: 'var(--paper)', fontFamily: 'IBM Plex Mono,monospace', fontSize: '12px', padding: '10px 16px', outline: 'none', marginBottom: '16px' }}
        placeholder="Search by route or stop name..."
        value={search} onChange={e => setSearch(e.target.value)}
      />

      {/* Route list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
        {filtered.map(r => (
          <div key={r.id}>
            <div
              onClick={() => setSelected(selected?.id === r.id ? null : r)}
              style={{ background: selected?.id === r.id ? 'var(--ink2)' : 'var(--ink)', border: `1px solid ${selected?.id === r.id ? 'rgba(232,57,14,0.3)' : 'var(--border)'}`, padding: '16px 20px', cursor: 'crosshair', transition: 'all .15s', borderLeft: `3px solid ${r.type === 'ac' ? '#5fd49a' : 'var(--red)'}` }}
              onMouseEnter={e => { if (selected?.id !== r.id) e.currentTarget.style.background = 'var(--ink2)' }}
              onMouseLeave={e => { if (selected?.id !== r.id) e.currentTarget.style.background = 'var(--ink)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--paper)' }}>{r.name}</div>
                    <span style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: r.type === 'ac' ? '#5fd49a' : 'var(--red)', border: `1px solid ${r.type === 'ac' ? 'rgba(95,212,154,0.3)' : 'rgba(232,57,14,0.3)'}`, padding: '1px 6px' }}>{r.type.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--faded)', letterSpacing: '.5px' }}>
                    {r.stops[0].place} → {r.stops[r.stops.length - 1].place} · {r.stops.length} stops · {r.days}
                  </div>
                  {r.remarks && <div style={{ fontSize: '10px', color: 'var(--bronze)', marginTop: '3px' }}>★ {r.remarks}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--paper)', letterSpacing: '1px', lineHeight: 1 }}>
                    {r.stops[0].time}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--red)', letterSpacing: '1px', marginTop: '2px' }}>
                    {getNextBus(r)}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded stops */}
            {selected?.id === r.id && (
              <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderTop: 'none', padding: '16px 20px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '12px', fontWeight: 700 }}>// STOPS & TIMINGS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {r.stops.map((stop, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(242,237,228,0.05)' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 0 || i === r.stops.length - 1 ? 'var(--red)' : 'rgba(242,237,228,0.08)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: i === 0 || i === r.stops.length - 1 ? 'var(--paper)' : 'var(--faded)', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: '12px', color: i === 0 || i === r.stops.length - 1 ? 'var(--paper)' : 'var(--faded)', fontWeight: i === 0 || i === r.stops.length - 1 ? 700 : 400 }}>
                        {stop.place}
                      </div>
                      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '18px', color: 'var(--red)', letterSpacing: '1px', flexShrink: 0 }}>
                        {stop.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Evening trips */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--red)', marginBottom: '14px', fontWeight: 700 }}>// EVENING RETURN TRIPS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {EVENING_TRIPS.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '10px 14px', background: 'var(--ink)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: '22px', color: 'var(--red)', letterSpacing: '2px', flexShrink: 0 }}>{t.time}</div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--paper)' }}>{t.route}</div>
                <div style={{ fontSize: '10px', color: 'var(--faded)' }}>{t.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: '14px', fontWeight: 700 }}>IMPORTANT NOTES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--faded)', lineHeight: 1.7 }}>
              <span style={{ color: 'var(--red)', flexShrink: 0 }}>→</span>{tip}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)' }}>
        {[
          { label: 'Total Routes', val: ROUTES.filter(r => r.direction === 'to_bracu').length },
          { label: 'AC Routes', val: ROUTES.filter(r => r.type === 'ac').length },
          { label: 'Morning Trips', val: ROUTES.filter(r => r.direction === 'to_bracu').length },
          { label: 'Evening Trips', val: EVENING_TRIPS.length },
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