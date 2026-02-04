import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pensioen Beslissingstool | Scenario Comparison',
  description: 'Dutch Pension & Benefits Scenario Comparison Platform - Understand how pension contributions affect your taxes, benefits, and net income',
  keywords: ['pension', 'tax', 'benefits', 'scenario', 'Netherlands', 'rules-as-code'],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
