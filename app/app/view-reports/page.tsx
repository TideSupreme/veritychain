'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'

const BRAND = {
  burgundy: '#7B113A',
  slate: '#1E293B',
  offwhite: '#FDF8F4',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  accent: '#D4A574',
}

export default function ViewReportsPage() {
  const { getValueFromIdToken, token, doDecrypt } = useTideCloak()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const TAG = "field-report"

  useEffect(() => {
    if (token) {
      const vuid = getValueFromIdToken("vuid")
      // Find all keys matching our pattern
      const keys = typeof window !== "undefined" ? Object.keys(localStorage).filter(k => k.startsWith('vc-reports:')) : []
      const allReports: any[] = []

      if (keys.length > 0) {
        const processKeys = async () => {
          for (const key of keys) {
            try {
              const stored = localStorage.getItem(key)
              if (stored) {
                const parsed = JSON.parse(stored)
                const decrypted = await Promise.all(
                  parsed.map((r: any) =>
                    doDecrypt([{ encrypted: r.ciphertext, tags: [TAG] }])
                      .then(res => ({ id: r.id, ts: r.ts, data: JSON.parse(String(res[0])) }))
                      .catch(() => null)
                  )
                )
                allReports.push(...decrypted.filter(Boolean))
              }
            } catch (e) {}
          }
          setReports(allReports.reverse())
          setLoading(false)
        }
        processKeys()
      } else {
        setLoading(false)
      }
    }
  }, [token])

  return (
    <div style={{ minHeight: '100vh', background: BRAND.offwhite, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: `1px solid ${BRAND.lightGrey}`, padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/home" style={{ color: BRAND.slate, textDecoration: 'none', fontWeight: 500, fontSize: '14px' }}>← Back to Dashboard</Link>
          <span style={{ color: BRAND.grey, fontSize: '13px' }}>{reports.length} filed</span>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <h1 style={{ fontSize: '28px', color: BRAND.slate, marginBottom: '0.5rem' }}>My Field Reports</h1>
        <p style={{ color: BRAND.grey, marginBottom: '2rem' }}>
          Every report is encrypted at rest. Only your verified identity can decrypt it for viewing — nobody else, not even the server operator.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: BRAND.grey }}>
            <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⏳</div>
            <p style={{ fontSize: '15px' }}>Decrypting your reports…</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: '12px', textAlign: 'center', border: `1px solid ${BRAND.lightGrey}` }}>
            <div style={{ fontSize: '56px', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ color: BRAND.slate, fontSize: '20px', margin: '0 0 0.5rem' }}>No reports filed yet</h2>
            <p style={{ color: BRAND.grey, margin: '0 0 1.5rem', fontSize: '15px' }}>
              Head out to your polling station and document what you see. Every observation counts.
            </p>
            <Link href="/submit-report" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: BRAND.burgundy, color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
              File Your First Report
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reports.map((r, i) => (
              <div key={i} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: BRAND.slate, fontSize: '16px', marginBottom: '3px' }}>{r.data?.category || 'Uncategorized'}</div>
                    <div style={{ fontSize: '13px', color: BRAND.grey }}>{r.data?.station} • {r.data?.location} • {r.data?.timestamp}</div>
                  </div>
                  <span style={{ background: '#ECFDF5', color: '#0D9488', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    SEALED
                  </span>
                </div>
                <div style={{ background: BRAND.lightGrey, padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '14px', color: BRAND.slate, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.data?.description}</div>
                </div>
                {r.data?.witnesses && (
                  <div style={{ fontSize: '12px', color: BRAND.grey, marginBottom: '0.25rem' }}>
                    👤 Witnesses: {r.data.witnesses}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: BRAND.grey, fontFamily: 'monospace' }}>
                  ID: {r.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}