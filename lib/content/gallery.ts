// Brian Rankin's gallery, where the World of Charlie Rogers Exhibition hangs
// and where, until the shop takes orders online, the book, prints and cards
// can be ordered.
//
// The text is Brian's own, from his email of 23 October 2026, with the
// heading set in sentence case. The address, phone, opening hours and email
// are from his email of 15 October 2026. The photograph is his, sent with the
// 23 October email.

export const gallery = {
  name: 'Come View My Art Gallery',
  heading: 'The Come View My Art Gallery in Gateshead',
  text: [
    'Here visitors can enjoy browsing the World of Charlie Rogers Exhibition. More than 50 of Charlie’s paintings are on display together with details of his extraordinary life story. Prearranged talks are available for any art groups, organisations and single visitors planning to visit the gallery.',
  ],
  street: '122 Sheriffs Highway',
  town: 'Gateshead',
  postcode: 'NE9 5SD',
  phone: '07742 749906',
  phoneHref: 'tel:+447742749906',
  email: 'briart4444@hotmail.com',
  hours: 'Monday to Saturday, 10am to 5pm',
  // Opening hours in schema.org form, for the structured data.
  openingHours: 'Mo-Sa 10:00-17:00',
  photo: {
    src: '/artwork/gallery/come-view-my-art-gallery.jpg',
    width: 1170,
    height: 867,
    alt: 'The shopfront of Come View My Art Gallery on Sheriffs Highway, Gateshead: a pale blue fascia with the name in red, paintings in the windows, and a hanging sign for the World of Charlie Rogers Exhibition.',
  },
} as const

export const galleryAddress = `${gallery.street}, ${gallery.town} ${gallery.postcode}`

export const galleryMapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${gallery.name}, ${galleryAddress}`,
)}`
