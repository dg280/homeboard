import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HOMEBOARD',
  description: 'Météo multi-villes — Prévisions, tenue, qualité de l\'air',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
