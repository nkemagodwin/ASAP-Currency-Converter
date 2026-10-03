import { Inter } from 'next/font/google'
import { Providers } from './providers/Providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ASAP Funds — Currency intelligence for modern teams',
  description: 'Convert currencies, track your portfolio, and make smarter international money decisions from one workspace.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
