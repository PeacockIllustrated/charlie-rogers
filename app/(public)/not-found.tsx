import { NotFoundPanel } from '@/components/NotFoundPanel'

// Catches notFound() raised inside a public page, for example an unknown shop
// slug. The (public) layout already supplies the header and footer, so this
// renders the body alone.
export default function PublicNotFound() {
  return <NotFoundPanel />
}
