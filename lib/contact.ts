// The contact page: Brian Rankin's sections and where messages go. Brian sent
// the wording on 13 November 2026 and asked for messages to reach his own
// address. Kept in one place so the page, the form and the server action agree
// on the topics.

// Where contact messages are emailed. Brian's address, unless the hosting
// environment names another (CONTACT_EMAIL), so it can be changed without a
// code change. The address is never printed on the page by the form; the
// gallery block elsewhere on the site already publishes it.
export function contactRecipient(): string {
  return process.env.CONTACT_EMAIL || 'briart4444@hotmail.com'
}

// The Charlie Rogers Fan Club on Facebook. Brian named the group but did not
// send its link; until NEXT_PUBLIC_FACEBOOK_GROUP_URL is set the page sends
// people to a Facebook search for the group's name.
export const FACEBOOK_GROUP_NAME = 'Charlie Rogers Fan Club'
export const facebookGroupHref =
  process.env.NEXT_PUBLIC_FACEBOOK_GROUP_URL ||
  `https://www.facebook.com/search/groups/?q=${encodeURIComponent(FACEBOOK_GROUP_NAME)}`

export type ContactTopic = 'question' | 'back-catalogue' | 'authentication' | 'story' | 'talk'

export interface Topic {
  slug: ContactTopic
  // The section heading on the page.
  title: string
  // The short name used on the form and in the email subject.
  label: string
  // Brian's text, as he sent it, with house style applied.
  text: string[]
  // What the message box starts with.
  prompt: string
  // Whether the sender can add photographs.
  images: boolean
}

export const intro = 'Please send a message if you have a question about Charlie Rogers.'

export const topics: Topic[] = [
  {
    slug: 'question',
    title: 'A question about Charlie',
    label: 'A question',
    // Brian's opening line covers this one; it has no section of its own.
    text: [],
    prompt: 'What would you like to know?',
    images: false,
  },
  {
    slug: 'back-catalogue',
    title: 'Back catalogue',
    label: 'Back catalogue',
    text: [
      'You are invited to send details, including an image, of Charlie’s work, which will be added to the back catalogue.',
    ],
    prompt: 'For example, the title, the year, the size and where the painting came from, if you know them.',
    images: true,
  },
  {
    slug: 'authentication',
    title: 'Authentication',
    label: 'Authentication',
    text: ['Reach out for advice regarding the authentication of work by Charlie Rogers.'],
    prompt: 'Tell us about the work, and add a photograph of the front and the back if you can.',
    images: true,
  },
  {
    slug: 'story',
    title: 'Have you a story to tell?',
    label: 'A story',
    text: [
      'Any personal stories about Charlie would be greatly appreciated as we continue to piece together his incredible life story.',
    ],
    prompt: 'However you knew Charlie, we would love to hear it.',
    images: true,
  },
  {
    slug: 'talk',
    title: 'Arrange a talk',
    label: 'A talk',
    text: [
      'Talks are available by advocate Brian Rankin.',
      'Educational organisations (particularly schools, colleges and universities), art groups, social groups, business associations, professional organisations, etc. are encouraged to participate to learn more about Charlie Rogers’ story.',
    ],
    prompt: 'For example, your organisation, roughly how many people, and the dates that suit you.',
    images: false,
  },
]

export const facebook = {
  title: 'Facebook group invitation',
  text: 'Become a member of the Charlie Rogers Fan Club on Facebook to keep up to date with upcoming events and newly discovered paintings and stories.',
}

export function topicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug)
}

// Photographs a sender can add. The browser shrinks each one before sending,
// so a phone photograph of a painting arrives at a size that still shows the
// signature but fits under the hosting limit for one request.
export const CONTACT_IMAGES = {
  max: 3,
  // Longest side after shrinking, in pixels.
  longest: 2000,
  // Per file, after shrinking.
  maxBytes: 1_200_000,
  types: ['image/jpeg', 'image/png', 'image/webp'] as const,
}
