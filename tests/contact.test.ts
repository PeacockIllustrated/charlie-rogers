// Run with: pnpm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderEmailHtml } from '../lib/shop/email-layout.ts'
import { contactEmail } from '../lib/shop/email-content.ts'

const base = {
  topicLabel: 'Back catalogue',
  text: 'I have a Charlie Rogers of the Quayside, signed 1979.',
  name: 'Jean Smith',
  email: 'jean@example.com',
  phone: null,
  images: [] as string[],
  imagesFailed: 0,
}

test('contact email names the topic and sender and carries the message', () => {
  const e = contactEmail(base)
  assert.match(e.subject, /back catalogue from Jean Smith/)
  const html = renderEmailHtml(e.doc)
  assert.match(html, /signed 1979/)
  assert.match(html, /contact page/)
  assert.doesNotMatch(html, /photograph/i)
})

test('contact email links each photograph and says when one failed', () => {
  const e = contactEmail({ ...base, images: ['https://x.test/a.jpg', 'https://x.test/b.jpg'], imagesFailed: 1 })
  const html = renderEmailHtml(e.doc)
  assert.match(html, /See photograph 1/)
  assert.match(html, /See photograph 2/)
  assert.match(html, /One photograph could not be saved/)
})
