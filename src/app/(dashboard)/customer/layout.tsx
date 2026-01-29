import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-10">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
