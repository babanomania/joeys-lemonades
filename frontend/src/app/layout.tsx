import type { Metadata } from 'next'
import { Open_Sans, Lato } from 'next/font/google'
import './globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import { Providers } from './providers'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: "Joey's Lemonades",
  description: 'Fresh, customizable lemonades with blockchain rewards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${lato.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
