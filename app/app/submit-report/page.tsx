'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useCallback } from 'react'
import Link from 'next/link'

const BRAND = {
  burgundy: '#7B113A',
  slate: '#1E293B',
  offwhite: '#FDF8F4',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  accent: '#D4A574',
}

const CATEGORIES = [
  'Ballot-box tampering',
  'Voter intimidation',
  'Counting irregularity',
  'Polling station access',
  'Campaign violation',
  'Media restriction',
  'Other',
]

export default function SubmitReportPage() {
  const { doEncrypt } = useTideCloak()
  const [formData, setFormData] = useState({
    category: '',
    station: '',
    location: '',
    timestamp: '',
    description: '',
    witnesses: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reportId, setReportId] = useState('')
  const [error, setError] = useState('')

  const TAG = "field-report"

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = JSON.stringify(formData)
      const [ciphertext] = await doEncrypt([{ data: payload, tags: [TAG] }])

      const vuid = typeof window !== "undefined" ? (() => {
        const stored = localStorage.getItem(`vc-reports:${localStorage.getItem('vuid') || ''}`)
        return stored ? '' : ''
      })() : ''

      // Find vuid from the key pattern
      const existingVuidKey = typeof window !== "undefined" ? Object.keys(localStorage).find(k => k.startsWith('vc-reports:')) : null
      const key = existingVuidKey || 'vc-reports:demo'

      const existing = localStorage.getItem(key) || '[]'
      const reports = JSON.parse(existing)
      const newReport = {
        id: `RPT-${Date.now().toString(36).toUpperCase()}`,
        ciphertext,
        ts: new Date().toISOString(),
      }
      reports.push(newReport)
      localStorage.setItem(key, JSON.stringify(reports))

      setReportId(newReport.id)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Encryption failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [formData, doEncrypt])

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: BRAND.offwhite, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 style={{ color: BRAND.slate, fontSize: '28px', marginBottom: '0.5rem' }}>Report Sealed</h1>
          <p style={{ color: BRAND.grey, margin: '0.5rem 0 2rem', lineHeight: 1.6 }}>
            Your field report has been encrypted and sealed. Only your identity can decrypt it for review. No mission chief, no headquarters — nobody can alter or suppress this observation.
          </p>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem', border: `1px solid ${BRAND.lightGrey}` }}>
            <div style={{ fontSize: '12px', color: BRAND.grey, fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Report ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '16px', color: BRAND.slate, fontWeight: 600 }}>{reportId}</div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '13px' }}>
              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>Encrypted at rest</span>
              <span style={{ background: '#ECFDF5', color: '#0D9488', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>Identity-sealed</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/home" style={{ color: BRAND.slate, textDecoration: 'none', fontWeight: 500, fontSize: '14px', padding: '0.5rem 1rem' }}>← Dashboard</Link>
            <Link href="/submit-report" style={{ background: BRAND.burgundy, color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }} onClick={() => { setSuccess(false); setFormData({ category: '', station: '', location: '', timestamp: '', description: '', witnesses: '' }) }}>
              File Another Report
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BRAND.offwhite, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: `1px solid ${BRAND.lightGrey}`, padding: '1rem 2rem' }}>
        <Link href="/home" style={{ color: BRAND.slate, textDecoration: 'none', fontWeight: 500, fontSize: '14px' }}>← Back to Dashboard</Link>
      </header>

      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '28px', color: BRAND.slate, marginBottom: '0.35rem' }}>Submit Field Report</h1>
          <p style={{ color: BRAND.grey, fontSize: '15px' }}>This report will be encrypted before transmission. Only your verified identity can decrypt it later.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.slate, marginBottom: '0.4rem' }}>Report Category *</label>
            <select name="category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${BRAND.lightGrey}`, borderRadius: '8px', fontSize: '15px', color: BRAND.slate, background: '#fff' }}>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.slate, marginBottom: '0.4rem' }}>Polling Station ID *</label>
              <input name="station" type="text" required value={formData.station} onChange={e => setFormData({...formData, station: e.target.value})}
                placeholder="e.g. PS-0421-NRB" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${BRAND.lightGrey}`, borderRadius: '8px', fontSize: '15px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.slate, marginBottom: '0.4rem' }}>Location</label>
              <input name="location" type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Kibera, Nairobi" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${BRAND.lightGrey}`, borderRadius: '8px', fontSize: '15px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.slate, marginBottom: '0.4rem' }}>Date & Time of Observation *</label>
            <input name="timestamp" type="datetime-local" required value={formData.timestamp} onChange={e => setFormData({...formData, timestamp: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${BRAND.lightGrey}`, borderRadius: '8px', fontSize: '15px' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.slate, marginBottom: '0.4rem' }}>Description *</label>
            <textarea name="description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what you observed. Include details: who, what happened, how many people, any officials involved…"
              style={{ width: '100%', minHeight: '120px', padding: '0.75rem', border: `1px solid ${BRAND.lightGrey}`, borderRadius: '8px', fontSize: '15px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.slate, marginBottom: '0.4rem' }}>Witnesses (optional)</label>
            <input name="witnesses" type="text" value={formData.witnesses} onChange={e => setFormData({...formData, witnesses: e.target.value})}
              placeholder="Names or identifiers of other witnesses present"
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${BRAND.lightGrey}`, borderRadius: '8px', fontSize: '15px' }} />
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            style={{
              width: '100%', padding: '0.875rem', background: BRAND.burgundy, color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
              boxShadow: `0 4px 14px rgba(123, 17, 58, 0.25)`,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => { if (!submitting) e.currentTarget.style.background = '#5E0D2C' }}
            onMouseOut={(e) => { if (!submitting) e.currentTarget.style.background = BRAND.burgundy }}
          >
            {submitting ? 'Sealing report…' : 'Seal & Submit Report'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: BRAND.grey, marginTop: '1rem' }}>
            Your report is encrypted with TideCloak before it leaves this device. Nobody but you can decrypt it.
          </p>
        </form>
      </div>
    </div>
  )
}