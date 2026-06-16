'use client'

import { useTideCloak } from '@tidecloak/nextjs'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import tcConfig from "../../tidecloak.json"

const BRAND = {
  burgundy: '#7B113A',
  slate: '#1E293B',
  offwhite: '#FDF8F4',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  accent: '#D4A574',
  success: '#0D9488',
  warning: '#D97706',
}

export default function HomePage() {
  const { logout, getValueFromIdToken, token, doEncrypt, doDecrypt } = useTideCloak()
  const [username, setUsername] = useState("")
  const [reports, setReports] = useState<any[]>([])

  const TAG = "field-report"

  useEffect(() => {
    if (token) {
      const name = getValueFromIdToken("preferred_username")
      setUsername(name || "Observer")

      const stored = typeof window !== "undefined" ? localStorage.getItem(`vc-reports:${getValueFromIdToken("vuid")}`) : null
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          Promise.all(parsed.map((r: any) =>
            doDecrypt([{ encrypted: r.ciphertext, tags: [TAG] }]).then(res => ({ ...r, data: JSON.parse(String(res[0])) }))
          )).then(decrypted => setReports(decrypted.filter(Boolean)))
        } catch (e) {}
      }
    }
  }, [token])

  const onLogout = useCallback(() => logout(), [logout])

  return (
    <div style={{ minHeight: '100vh', background: BRAND.offwhite, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: `1px solid ${BRAND.lightGrey}`, padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, background: BRAND.burgundy, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: BRAND.slate }}>VerityChain</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: BRAND.grey, fontSize: '14px' }}>{username}</span>
            <button onClick={onLogout} style={{ padding: '0.5rem 1rem', border: `1px solid ${BRAND.lightGrey}`, background: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: BRAND.slate }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        {/* Hero */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-block', background: '#FEF3C7', color: BRAND.warning, fontSize: '12px', padding: '4px 14px', borderRadius: '20px', fontWeight: 600, marginBottom: '1rem' }}>
            OSCE MISSION · KENYA 2026
          </div>
          <h1 style={{ fontSize: '32px', color: BRAND.slate, margin: '0 0 0.5rem', fontWeight: 700 }}>Your observations, sealed at source.</h1>
          <p style={{ color: BRAND.grey, fontSize: '15px', maxWidth: '560px', lineHeight: 1.55 }}>
            Every report you file is encrypted before it leaves your device. Only the designated oversight quorum can unseal it — no single person ever holds the key.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          <Link href="/submit-report" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
              <div style={{ width: 40, height: 40, background: BRAND.burgundy, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>+</span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: BRAND.slate, fontSize: '18px' }}>Submit Field Report</h3>
              <p style={{ color: BRAND.grey, fontSize: '14px', margin: 0 }}>Document an incident, attach evidence, seal it cryptographically.</p>
            </div>
          </Link>

          <Link href="/view-reports" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, background: BRAND.slate, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#fff', fontSize: '18px' }}>📋</span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: BRAND.slate, fontSize: '18px' }}>My Reports</h3>
              <p style={{ color: BRAND.grey, fontSize: '14px', margin: 0 }}>Review your submitted field reports and their seal status.</p>
            </div>
          </Link>

          <Link href="/incidents" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, background: '#0D9488', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#fff', fontSize: '18px' }}>⚠</span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: BRAND.slate, fontSize: '18px' }}>Incident Map</h3>
              <p style={{ color: BRAND.grey, fontSize: '14px', margin: 0 }}>Track reported irregularities across polling stations.</p>
            </div>
          </Link>

          <Link href="/mission" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '12px', border: `1px solid ${BRAND.lightGrey}`, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, background: BRAND.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#fff', fontSize: '18px' }}>📊</span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', color: BRAND.slate, fontSize: '18px' }}>Mission Dashboard</h3>
              <p style={{ color: BRAND.grey, fontSize: '14px', margin: 0 }}>Overview of your deployment, coverage, and submission stats.</p>
            </div>
          </Link>
        </div>

        {/* Recent Reports */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '20px', color: BRAND.slate, margin: 0 }}>Recent Field Reports</h2>
            <span style={{ fontSize: '13px', color: BRAND.grey }}>{reports.length} submitted</span>
          </div>

          {reports.length === 0 ? (
            <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: `1px solid ${BRAND.lightGrey}` }}>
              <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🗳️</div>
              <p style={{ color: BRAND.grey, margin: '0 0 1rem', fontSize: '15px' }}>No reports filed yet. Your first observation starts the record.</p>
              <Link href="/submit-report" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: BRAND.burgundy, color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                File Your First Report
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {reports.slice(0, 5).map((r, i) => (
                <div key={i} style={{ background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '10px', border: `1px solid ${BRAND.lightGrey}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: BRAND.slate, marginBottom: '2px' }}>{r.data?.category || 'Field Report'}</div>
                    <div style={{ fontSize: '13px', color: BRAND.grey }}>{r.data?.station} • {r.data?.timestamp?.slice(0, 10)}</div>
                  </div>
                  <span style={{ background: '#ECFDF5', color: BRAND.success, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                    SEALED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

