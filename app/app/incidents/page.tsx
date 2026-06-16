'use client'

import Link from 'next/link'

const BRAND = {
  burgundy: '#7B113A',
  slate: '#1E293B',
  offwhite: '#FDF8F4',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  accent: '#D4A574',
  warning: '#D97706',
  danger: '#DC2626',
  success: '#0D9488',
}

const INCIDENTS = [
  { id: 'INC-001', category: 'Ballot-box tampering', station: 'PS-0421-NRB', location: 'Kibera, Nairobi', time: '2026-06-15 07:42', severity: 'Critical', description: 'Seals on ballot box #3 found broken before polls opened. Presiding officer unable to explain.' },
  { id: 'INC-002', category: 'Voter intimidation', station: 'PS-0188-KSM', location: 'Kondele, Kisumu', time: '2026-06-15 09:15', severity: 'High', description: 'Group of unidentified men loitering within 50m of polling station, photographing voters as they entered.' },
  { id: 'INC-003', category: 'Counting irregularity', station: 'PS-0312-MSA', location: 'Likoni, Mombasa', time: '2026-06-15 18:30', severity: 'High', description: 'Vote count announced before all party agents were present. Discrepancy of 147 votes vs observer tally.' },
  { id: 'INC-004', category: 'Media restriction', station: 'PS-0750-NRB', location: 'Eastleigh, Nairobi', time: '2026-06-15 14:10', severity: 'Medium', description: 'Journalist denied entry despite valid accreditation. Police cited "security concerns" without elaboration.' },
  { id: 'INC-005', category: 'Polling station access', station: 'PS-0234-ELD', location: 'Langas, Eldoret', time: '2026-06-15 06:30', severity: 'Medium', description: 'Station opened 45 minutes late. Queue of 200+ voters. No explanation from electoral commission staff.' },
]

const severityColors: Record<string, string> = {
  Critical: '#DC2626',
  High: '#D97706',
  Medium: '#0D9488',
}

export default function IncidentsPage() {
  return (
    <div style={{ minHeight: '100vh', background: BRAND.offwhite, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: `1px solid ${BRAND.lightGrey}`, padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link href="/home" style={{ color: BRAND.slate, textDecoration: 'none', fontWeight: 500, fontSize: '14px' }}>← Back to Dashboard</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: BRAND.slate, marginBottom: '0.35rem' }}>Incident Map</h1>
            <p style={{ color: BRAND.grey, fontSize: '15px' }}>
              All reported irregularities across the mission area. Data is verified cryptographically — every entry links to a sealed observer report.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', textAlign: 'center' }}>
            <div style={{ background: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', border: `1px solid ${BRAND.lightGrey}` }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: BRAND.danger }}>2</div>
              <div style={{ fontSize: '11px', color: BRAND.grey }}>Critical</div>
            </div>
            <div style={{ background: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', border: `1px solid ${BRAND.lightGrey}` }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: BRAND.warning }}>5</div>
              <div style={{ fontSize: '11px', color: BRAND.grey }}>Total</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 100px 100px', padding: '0.75rem 1.25rem', background: BRAND.lightGrey, alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: BRAND.grey, textTransform: 'uppercase' }}>ID</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: BRAND.grey, textTransform: 'uppercase' }}>Category / Station</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: BRAND.grey, textTransform: 'uppercase' }}>Description</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: BRAND.grey, textTransform: 'uppercase' }}>Time</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: BRAND.grey, textTransform: 'uppercase', textAlign: 'right' }}>Severity</span>
          </div>

          {INCIDENTS.map((inc, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 100px 100px', padding: '1rem 1.25rem', borderTop: `1px solid ${BRAND.lightGrey}`, alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: BRAND.grey }}>{inc.id}</span>
              <div>
                <div style={{ fontWeight: 600, color: BRAND.slate, fontSize: '14px', marginBottom: '2px' }}>{inc.category}</div>
                <div style={{ fontSize: '12px', color: BRAND.grey }}>{inc.station} · {inc.location}</div>
              </div>
              <div style={{ fontSize: '13px', color: BRAND.slate, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {inc.description}
              </div>
              <span style={{ fontSize: '12px', color: BRAND.grey }}>{inc.time}</span>
              <span style={{
                display: 'inline-block',
                background: severityColors[inc.severity] + '15',
                color: severityColors[inc.severity],
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
                justifySelf: 'end',
              }}>
                {inc.severity}
              </span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '13px', color: BRAND.grey, textAlign: 'center' }}>
          Each incident links to a sealed VerityChain field report. Tampering with the underlying report is cryptographically impossible.
        </p>
      </div>
    </div>
  )
}