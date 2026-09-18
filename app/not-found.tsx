import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { NotFoundPanel } from '@/components/NotFoundPanel'

// Catches URLs that match no route at all. These sit outside the (public)
// route group, so the site chrome has to be supplied here to match the rest
// of the site.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundPanel />
      </main>
      <Footer />
    </>
  )
}
