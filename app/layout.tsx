import './globals.css'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { AuthInitializer } from '@/components/AuthInitializer'
import AntDesignProvider from '@/components/AntDesignProvider'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'TrailNote: Route Planner for Custom Maps, Markers & Routes',
  description: 'With TrailNote’s powerful route planner, design and share custom maps instantly. Add markers, plot routes, and collaborate seamlessly—perfect for outdoor adventures, real-estate tours, logistics planning, and more.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'TrailNote: Route Planner for Custom Maps, Markers & Routes',
    description: 'With TrailNote’s powerful route planner, design and share custom maps instantly. Add markers, plot routes, and collaborate seamlessly—perfect for outdoor adventures, real-estate tours, logistics planning, and more.',
    url: 'https://trailnote.co/',
    type: 'website',
    images: [
      {
        url: '/dashboard.png',
        alt: 'TrailNote: Route Planner for Custom Maps, Markers & Routes Screenshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrailNote: Route Planner for Custom Maps, Markers & Routes',
    description: 'With TrailNote’s powerful route planner, design and share custom maps instantly. Add markers, plot routes, and collaborate seamlessly—perfect for outdoor adventures, real-estate tours, logistics planning, and more.',
    images: [
      {
        url: '/dashboard.png',
        alt: 'TrailNote: Route Planner for Custom Maps, Markers & Routes Screenshot',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <AuthInitializer>
          <AntDesignProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </AntDesignProvider>
        </AuthInitializer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
