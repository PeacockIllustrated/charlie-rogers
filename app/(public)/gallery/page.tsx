import type { Metadata } from 'next'
import { GalleryVisit } from '@/components/GalleryVisit'
import { gallery } from '@/lib/content/gallery'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Visit the gallery',
  description:
    'The World of Charlie Rogers Exhibition at Come View My Art Gallery, 122 Sheriffs Highway, Gateshead: more than 50 of Charlie’s paintings on display, with prearranged talks for groups and visitors.',
  alternates: { canonical: '/gallery' },
}

const galleryJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ArtGallery',
  name: gallery.name,
  description: gallery.text[0],
  image: `${SITE_URL}${gallery.photo.src}`,
  telephone: '+447742749906',
  email: gallery.email,
  openingHours: gallery.openingHours,
  address: {
    '@type': 'PostalAddress',
    streetAddress: gallery.street,
    addressLocality: gallery.town,
    postalCode: gallery.postcode,
    addressCountry: 'GB',
  },
}

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-content px-6 pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <GalleryVisit as="h1" id="gallery-heading" />
    </div>
  )
}
