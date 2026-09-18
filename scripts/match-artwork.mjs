#!/usr/bin/env node
// Match a folder of downloaded email attachments back to the emails that
// carried them, using file size in bytes as the join key.
//
// Filenames cannot be trusted: Brian Rankin sends from an iPhone, so
// image00001.jpg, Image-1.jpg and image.png each recur across unrelated
// emails, and "Paul Wright.jpg" is in fact the Third Street, Bensham snow
// scene. Size is unique for 83 of the 89 catalogued attachments, and every
// collision is either Mail Drop placeholder markup or exhibition photography,
// so no painting is ambiguous.
//
// Usage: node scripts/match-artwork.mjs <directory>
//
// Prints three lists: files matched to an email, files on disk that are not in
// the manifest, and catalogued attachments not found on disk.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node scripts/match-artwork.mjs <directory>')
  process.exit(1)
}

// Resolved from this file rather than the working directory, so the script can
// be run from anywhere, including a Windows shell sitting in another folder.
const manifestPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'docs',
  'artwork-inbox',
  'manifest.json',
)

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

const bySize = new Map()
for (const a of manifest.attachments) {
  if (!bySize.has(a.sizeBytes)) bySize.set(a.sizeBytes, [])
  bySize.get(a.sizeBytes).push(a)
}

// Walk the directory recursively; downloads often land in dated subfolders.
function walk(d) {
  const out = []
  for (const entry of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else if (entry.isFile()) out.push(p)
  }
  return out
}

const files = walk(resolve(dir))
const matched = []
const unknown = []
const seen = new Set()

for (const f of files) {
  const size = statSync(f).size
  const candidates = bySize.get(size)
  if (!candidates) {
    unknown.push({ file: f, size })
    continue
  }
  for (const c of candidates) seen.add(c)
  matched.push({ file: f, size, candidates })
}

const missing = manifest.attachments.filter((a) => !seen.has(a))

console.log(`Matched ${matched.length} of ${files.length} files on disk\n`)

for (const m of matched) {
  const tag = m.candidates.length > 1 ? ' [AMBIGUOUS]' : ''
  console.log(`${m.file}  (${m.size} bytes)${tag}`)
  for (const c of m.candidates) {
    const title = c.productTitle ? `${c.productTitle}, ${c.productYear ?? 'no year'}` : c.subject
    console.log(`  -> ${title}`)
    console.log(`     slug: ${c.suggestedSlug}`)
    console.log(`     ${c.visualDescription}`)
  }
  console.log()
}

if (unknown.length) {
  console.log(`\n${unknown.length} files on disk not in the manifest:`)
  for (const u of unknown) console.log(`  ${u.file}  (${u.size} bytes)`)
}

if (missing.length) {
  console.log(`\n${missing.length} catalogued attachments not found on disk:`)
  for (const a of missing) {
    console.log(`  ${a.name}  (${a.sizeBytes} bytes)  ${a.subject}`)
  }
}
