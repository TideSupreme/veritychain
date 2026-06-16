'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const BRAND = {
  burgundy: '#7B113A',
  slate: '#1E293B',
  offwhite: '#FDF8F4',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  accent: '#D4A574',
  success: '#0D9488',
}

export default function MissionPage() {
  const { getValueFromIdToken, token } = useTideCloak()
  const [username, setUsername] = useState("")
  const [reportCount, setReportCount] = useState(0)
  const [stationsVisited, setStationsVisited] = useState(0)

  useEffect(() => {
    if (token) {
      setUsername(getValueFromIdToken("preferred_username") || "Observer")

      const keys = typeof window !== "undefined" ? Object.keys(localStorage).filter(k => k.startsWith('vc-reports:')) : []
      let total = 0
      const stationSet = new Set<string>()
      keys.forEach(key => {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const parsed = JSON.parse(stored)
            total += parsed.length
          }
        } catch (e) {}
      })
      setReportCount(total)
      setStationsVisited(Math.min(total, 5)) // demo: 1 station per report
    }
  }, [token])

  return (
    <div style={{ minHeight: '100vh', background: BRAND.offwhite, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: `1px solid ${BRAND.lightGrey}`, padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/home" style={{ color: BRAND.slate, textDecoration: 'none', fontWeight: 500, fontSize: '14px' }}>← Back to Dashboard</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-block', background: BRAND.accent, color: '#fff', fontSize: '12px', padding: '4px 14px', borderRadius: '20px', fontWeight: 600, marginBottom: '0.75rem' }}>
            ACTIVE DEPLOYMENT
          </div>
          <h1 style={{ fontSize: '28px', color: BRAND.slate, margin: '0 0 0.5rem' }}>Mission Dashboard</h1>
          <p style={{ color: BRAND.grey, fontSize: '15px' }}>Observer: {username} — OSCE Election Observation Mission, Kenya 2026</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '13px', color: BRAND.grey, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Reports Filed</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: BRAND.burgundy }}>{reportCount}</div>
            <div style={{ fontSize: '12px', color: BRAND.grey, marginTop: '0.25rem' }}>All cryptographically sealed</div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '13px', color: BRAND.grey, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Stations Visited</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: BRAND.slate }}>{stationsVisited}</div>
            <div style={{ fontSize: '12px', color: BRAND.grey, marginTop: '0.25rem' }}>Out of 12 assigned</div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '13px', color: BRAND.grey, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Seal Integrity</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: BRAND.success }}>100%</div>
            <div style={{ fontSize: '12px', color: BRAND.grey, marginTop: '0.25rem' }}>No tampering detected</div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '13px', color: BRAND.grey, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Coverage</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: BRAND.accent }}>42%</div>
            <div style={{ fontSize: '12px', color: BRAND.grey, marginTop: '0.25rem' }}>5 of 12 stations completed</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '18px', color: BRAND.slate, margin: '0 0 1rem' }}>Assigned Polling Stations</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { id: 'PS-0421-NRB', name: 'Kibera Primary School', status: 'Visited', date: '2026-06-15' },
              { id: 'PS-0188-KSM', name: 'Kondele Social Hall', status: 'Visited', date: '2026-06-15' },
              { id: 'PS-0312-MSA', name: 'Likoni Community Centre', status: 'Visited', date: '2026-06-15' },
              { id: 'PS-0750-NRB', name: 'Eastleigh Secondary', status: 'Visited', date: '2026-06-15' },
              { id: 'PS-0234-ELD', name: 'Langas Chief\'s Camp', status: 'Visited', date: '2026-06-15' },
              { id: 'PS-0510-MRU', name: 'Meru Town Hall', status: 'Pending', date: null },
              { id: 'PS-0034-NKU', name: 'Nakuru Central School', status: 'Pending', date: null },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: i < 6 ? `1px solid ${BRAND.lightGrey}` : 'none' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', color: BRAND.slate, fontWeight: 600 }}>{s.id}</span>
                  <span style={{ marginLeft: '0.75rem', fontSize: '14px', color: BRAND.slate }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {s.date && <span style={{ fontSize: '12px', color: BRAND.grey }}>{s.date}</span>}
                  <span style={{
                    background: s.status === 'Visited' ? '#ECFDF5' : '#FEF3C7',
                    color: s.status === 'Visited' ? BRAND.success : '#92400E',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/submit-report" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: BRAND.burgundy, color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            File Next Observation
          </Link>
        </div>
      </div>
    </div>
  )
}