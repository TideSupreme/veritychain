import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  TideCloakProvider
} from '@tidecloak/nextjs'
import tcConfig from '../tidecloak.json'


export const metadata: Metadata = {
  title: 'VerityChain — Unsuppressable Election Observation',
  description: 'Field reports sealed at capture, decrypted only by oversight consensus. No middleman. No suppression.',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <TideCloakProvider config={tcConfig}>
          {children}
        </TideCloakProvider>
      </body>
    </html>
  )
}
