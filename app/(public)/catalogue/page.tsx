import { redirect } from 'next/navigation'

// The catalogue is browsed from /work; this path only exists as the parent of
// the entry pages.
export default function CatalogueIndex() {
  redirect('/work')
}
