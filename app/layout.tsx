import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/AppProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Navayuga Jarvis · AI Command Center',
  description: 'Navayuga Engineering Company Limited — AI-powered Decision Intelligence Control Room powered by Jarvis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('necl-theme'),r=document.documentElement;if(t==='light'){r.style.setProperty('--color-necl-bg','#F1F5F9');r.style.setProperty('--color-necl-surface','#FFFFFF');r.style.setProperty('--color-necl-border','#E2E8F0');r.style.setProperty('--color-necl-muted','#64748B');r.style.setProperty('--color-necl-text','#0F172A');}else{r.classList.add('dark');}})()`,
          }}
        />
      </head>
      <body className="bg-necl-bg text-necl-text antialiased min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
