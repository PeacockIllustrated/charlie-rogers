#!/usr/bin/env node
// Merge the per-batch email catalogues into one flat attachment index.
//
// The three emails-*.json files are keyed by message. This flattens them to one
// row per attachment, which is the shape needed to match files on disk back to
// the email that carried them.
//
// Byte size is the join key, not filename. Brian Rankin sends from an iPhone,
// so names such as image00001.jpg, Image-1.jpg and image.png repeat across
// unrelated emails, and at least one is actively misleading: the file called
// "Paul Wright.jpg" is the Third Street, Bensham snow scene, not a photograph
// of the printer.
//
// Usage: node scripts/build-artwork-manifest.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const INBOX = 'docs/artwork-inbox'
const OUT = join(INBOX, 'manifest.json')

const batches = readdirSync(INBOX)
  .filter((f) => /^emails-[a-z]\.json$/.test(f))
  .sort()

if (batches.length === 0) {
  console.error(`No emails-*.json found in ${INBOX}`)
  process.exit(1)
}

const rows = []
const messages = []

for (const file of batches) {
  const batch = JSON.parse(readFileSync(join(INBOX, file), 'utf8'))
  for (const m of batch) {
    messages.push(m)
    for (const a of m.attachments ?? []) {
      rows.push({
        sizeBytes: a.sizeBytes,
        name: a.name,
        contentType: a.contentType,
        isInline: a.isInline,
        suggestedSlug: a.suggestedSlug,
        visualDescription: a.visualDescription,
        // Provenance, so a matched file can be traced back to its source.
        messageIndex: m.messageIndex,
        subject: m.subject,
        receivedDateTime: m.receivedDateTime,
        messageId: m.messageId,
        // Product copy, where the email was presenting something for sale.
        productTitle: m.product?.title ?? null,
        productYear: m.product?.year ?? null,
        productMedium: m.product?.medium ?? null,
        productDimensions: m.product?.dimensions ?? null,
        productPrice: m.product?.price ?? null,
      })
    }
  }
}

rows.sort((a, b) => a.sizeBytes - b.sizeBytes)

// A duplicate byte size makes the join ambiguous for those rows, so surface it
// rather than letting a silent mismatch through.
const bySize = new Map()
for (const r of rows) {
  if (!bySize.has(r.sizeBytes)) bySize.set(r.sizeBytes, [])
  bySize.get(r.sizeBytes).push(r)
}
const collisions = [...bySize.entries()].filter(([, v]) => v.length > 1)

const undescribed = rows.filter(
  (r) => !r.visualDescription || /not view|exceed|unviewable/i.test(r.visualDescription),
)

const manifest = {
  generatedFrom: batches,
  messageCount: messages.length,
  attachmentCount: rows.length,
  uniqueByteSizes: bySize.size,
  collisionCount: collisions.length,
  undescribedCount: undescribed.length,
  expiredMailDrop: messages
    .filter((m) => m.mailDrop)
    .map((m) => ({
      subject: m.subject,
      receivedDateTime: m.receivedDateTime,
      availableUntil: m.mailDrop.availableUntil,
      whatIsMissing: m.mailDrop.whatIsMissing,
    })),
  attachments: rows,
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n')

console.log(`Wrote ${OUT}`)
console.log(`  messages     ${manifest.messageCount}`)
console.log(`  attachments  ${manifest.attachmentCount}`)
console.log(`  unique sizes ${manifest.uniqueByteSizes}`)
console.log(`  undescribed  ${manifest.undescribedCount}`)
console.log(`  expired      ${manifest.expiredMailDrop.length}`)

if (collisions.length) {
  console.log(`\n${collisions.length} byte size collisions, ambiguous to match:`)
  for (const [size, group] of collisions) {
    console.log(`  ${size} bytes`)
    for (const r of group) console.log(`    ${r.name}  (${r.subject})`)
  }
}
