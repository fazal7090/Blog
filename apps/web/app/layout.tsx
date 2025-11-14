// app/layout.tsx
import "../styles/globals.css"
import type { ReactNode } from "react"
import Link from "next/link"
import { RootProviders } from '~/components/root-providers';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

export default async function RootLayout({ children }: { children: ReactNode }) {
 
  const { language } = await createI18nServerInstance();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-slate-100 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Blog Web
              </h1>

             
            </div>
          </div>
        </header>

        <RootProviders lang={language}>
          {children}
        </RootProviders>
      </body>
    </html>
  )
}