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

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node scripts/match-artwork.mjs <directory>')
  process.exit(1)
}

// Resolved from this file rather than the working directory, so the script runs
// from anywhere. Looks beside itself first, which is the case when both files
// have been downloaded into one folder, then falls back to the repo layout.
const here = dirname(fileURLToPath(import.meta.url))
const candidates = [
  resolve(here, 'manifest.json'),
  resolve(here, '..', 'docs', 'artwork-inbox', 'manifest.json'),
]

const manifestPath = candidates.find((p) => existsSync(p))
if (!manifestPath) {
  console.error('Could not find manifest.json. Looked in:')
  for (const p of candidates) console.error(`  ${p}`)
  console.error('\nPut manifest.json in the same folder as this script.')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

// Microsoft Graph reports an attachment's MIME-encoded size, including the part
// headers, not the size of the decoded file. A saved file is therefore a few
// hundred bytes SMALLER than the catalogued figure. Measured overhead across
// confirmed matches ran from 242 to 1063 bytes, so allow a window rather than
// requiring equality. The window is one-sided: the manifest figure is always
// the larger of the two.
const OVERHEAD_MAX = 1200

function candidatesFor(size) {
  return manifest.attachments.filter((a) => {
    const delta = a.sizeBytes - size
    return delta >= 0 && delta <= OVERHEAD_MAX
  })
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
  const { size, mtime } = statSync(f)
  const candidates = candidatesFor(size)
  if (candidates.length === 0) {
    // Report the nearest catalogued row, so a near miss caused by re-encoding
    // is distinguishable from a file that simply is not from these emails.
    const nearest = manifest.attachments.reduce((best, a) =>
      Math.abs(a.sizeBytes - size) < Math.abs(best.sizeBytes - size) ? a : best,
    )
    unknown.push({ file: f, size, mtime, nearest })
    continue
  }
  // Only a unique match settles a catalogued row. When a file's size lands in
  // a collision group, none of the candidates is accounted for, so leaving
  // them all unseen keeps them in the missing list where they can be chased,
  // rather than silently clearing several rows on the strength of one file.
  if (candidates.length === 1) seen.add(candidates[0])
  matched.push({ file: f, size, mtime, candidates })
}

// Saved in download order, which usually tracks the order the emails arrived.
matched.sort((a, b) => a.mtime - b.mtime)
unknown.sort((a, b) => a.mtime - b.mtime)

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
  for (const u of unknown) {
    const delta = u.nearest.sizeBytes - u.size
    console.log(`  ${u.file}  (${u.size} bytes)`)
    console.log(
      `     nearest catalogued: ${u.nearest.sizeBytes} bytes (${delta > 0 ? '+' : ''}${delta}), ${u.nearest.name}`,
    )
  }
}

if (missing.length) {
  console.log(`\n${missing.length} catalogued attachments not found on disk:`)
  for (const a of missing) {
    console.log(`  ${a.name}  (${a.sizeBytes} bytes)  ${a.subject}`)
  }
}
