'use client'

import { useCallback } from 'react'
import { useTideCloak } from '@tidecloak/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const BRAND = {
  burgundy: '#7B113A',
  slate: '#1E293B',
  offwhite: '#FDF8F4',
  grey: '#64748B',
  lightGrey: '#F1F5F9',
  accent: '#D4A574',
}

export default function LoginPage() {
  const { login, authenticated } = useTideCloak()
  const router = useRouter()

  const onLogin = useCallback(() => {
    login()
  }, [login])

  useEffect(() => {
    if (authenticated) {
      router.push('/home')
    }
  }, [authenticated])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${BRAND.slate} 0%, #0F172A 100%)`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
    }}>
      <div style={{
        background: '#fff',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        textAlign: 'center',
        maxWidth: '480px',
        width: '100%',
      }}>
        {/* Logo mark */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            background: `linear-gradient(135deg, ${BRAND.burgundy}, #9B1B4A)`,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px rgba(123, 17, 58, 0.3)`,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontSize: '26px', fontWeight: 700, color: BRAND.slate, letterSpacing: '-0.02em' }}>VerityChain</span>
        </div>

        <h1 style={{ margin: '0 0 0.75rem', fontSize: '32px', color: BRAND.slate, lineHeight: 1.2, fontWeight: 700 }}>
          Witness, sealed forever.
        </h1>
        <p style={{ color: BRAND.grey, fontSize: '15px', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          Every field report is encrypted at the moment of capture. No mission chief can suppress it. No headquarters can alter it.
        </p>

        <button
          onClick={onLogin}
          style={{
            width: '100%',
            padding: '0.875rem 2rem',
            fontSize: '1rem',
            borderRadius: '10px',
            border: 'none',
            background: BRAND.burgundy,
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.01em',
            transition: 'all 0.2s ease',
            boxShadow: `0 4px 14px rgba(123, 17, 58, 0.35)`,
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#5E0D2C'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = BRAND.burgundy; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Continue with Tide
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '12px', color: BRAND.grey }}>
          Your identity verifies you. Your reports cannot be touched.
        </p>
      </div>
    </div>
  )
}
