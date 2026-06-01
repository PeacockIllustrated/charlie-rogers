import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Public site chrome. Wraps every visitor-facing page with the header and footer.
// The body is a flex column (set on <body> in the root layout), so main grows to
// push the footer down.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
