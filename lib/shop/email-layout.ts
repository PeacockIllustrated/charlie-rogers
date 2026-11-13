// The look of every email the shop sends: the order and enquiry notices to
// the shop, the customer's receipt, and the test from Admin > Settings.
//
// Each email is described as a short list of blocks and rendered twice: as
// HTML in the book's style (wine red masthead, Garamond text, Jost labels,
// square corners, no shadows), and as plain text for mail programs that
// prefer it. Email clients ignore most CSS, so the HTML is table-based with
// inline styles only. Web fonts load in Apple Mail and iOS; elsewhere the
// Georgia and Futura-like fallbacks take over.
//
// Pure, with relative imports only, so it can be tested and previewed without
// Next or Supabase.

export type EmailBlock =
  | { kind: 'p'; text: string }
  | { kind: 'lines'; rows: Array<{ label: string; value: string; total?: boolean }> }
  | { kind: 'panel'; title?: string; text: string }
  | { kind: 'details'; title: string; lines: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'button'; label: string; href: string }

export interface EmailDoc {
  // Shown in the inbox after the subject, before the email is opened.
  preheader: string
  eyebrow: string
  title: string
  blocks: EmailBlock[]
  // Who the email is for, said in the footer. Shop notices say so, so a
  // forwarded one is not mistaken for a customer email.
  audience: 'customer' | 'shop'
}

const C = {
  page: '#F2EBDC',
  paper: '#FAF6EE',
  ink: '#1A1916',
  soft: '#44423D',
  mute: '#6B6860',
  rule: '#D9D2C0',
  red: '#7A1F1F',
  redDeep: '#5E1414',
}

const SERIF = "'EB Garamond', Garamond, Georgia, 'Times New Roman', serif"
const SANS = "Jost, Futura, 'Century Gothic', 'Trebuchet MS', Arial, sans-serif"

const SITE = 'https://www.charlierogers.art'
const GALLERY = 'Come View My Art Gallery, 122 Sheriffs Highway, Gateshead NE9 5SD'

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const lines = (s: string) => escapeHtml(s).replace(/\n/g, '<br>')

const label = (text: string, colour = C.red) =>
  `<div style="font-family:${SANS};font-size:11px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${colour};">${escapeHtml(text)}</div>`

function block(b: EmailBlock): string {
  switch (b.kind) {
    case 'p':
      return `<p style="margin:0 0 18px;font-family:${SERIF};font-size:18px;line-height:28px;color:${C.ink};">${lines(b.text)}</p>`
    case 'lines':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 26px;border-collapse:collapse;border-top:1px solid ${C.ink};">${b.rows
        .map(
          (r) =>
            `<tr><td style="padding:12px 12px 12px 0;border-bottom:1px solid ${r.total ? C.ink : C.rule};font-family:${r.total ? SANS : SERIF};font-size:${r.total ? '13px' : '17px'};line-height:24px;color:${C.ink};${r.total ? `letter-spacing:1.5px;text-transform:uppercase;` : ''}">${lines(r.label)}</td><td align="right" style="padding:12px 0;border-bottom:1px solid ${r.total ? C.ink : C.rule};font-family:${SERIF};font-size:17px;line-height:24px;color:${C.ink};white-space:nowrap;${r.total ? 'font-weight:600;' : ''}">${escapeHtml(r.value)}</td></tr>`,
        )
        .join('')}</table>`
    case 'panel':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;"><tr><td style="border-left:3px solid ${C.red};background:${C.page};padding:16px 20px;">${b.title ? `${label(b.title)}<div style="height:6px;line-height:6px;font-size:6px;">&nbsp;</div>` : ''}<div style="font-family:${SERIF};font-size:17px;line-height:26px;color:${C.ink};">${lines(b.text)}</div></td></tr></table>`
    case 'details':
      return `<div style="margin:0 0 22px;">${label(b.title, C.mute)}<div style="height:6px;line-height:6px;font-size:6px;">&nbsp;</div><div style="font-family:${SERIF};font-size:17px;line-height:26px;color:${C.ink};">${b.lines.filter(Boolean).map(lines).join('<br>')}</div></div>`
    case 'quote':
      return `<div style="margin:0 0 24px;padding:4px 0 4px 20px;border-left:1px solid ${C.rule};font-family:${SERIF};font-style:italic;font-size:18px;line-height:28px;color:${C.soft};">${lines(b.text)}</div>`
    case 'button':
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 26px;border-collapse:collapse;"><tr><td style="background:${C.red};"><a href="${escapeHtml(b.href)}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:${C.paper};text-decoration:none;">${escapeHtml(b.label)}</a></td></tr></table>`
  }
}

export function renderEmailHtml(doc: EmailDoc): string {
  const footerNote =
    doc.audience === 'shop'
      ? 'Sent to the shop by charlierogers.art. Customers never see this email.'
      : 'Sent by charlierogers.art because you ordered from the shop. Reply to this email to reach us.'
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(doc.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};">${escapeHtml(doc.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};border-collapse:collapse;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;">
<tr><td style="background:${C.red};padding:26px 36px 24px;">
<div style="font-family:${SANS};font-size:13px;line-height:18px;letter-spacing:5px;text-transform:uppercase;color:${C.paper};">Charlie Rogers</div>
<div style="font-family:${SERIF};font-style:italic;font-size:17px;line-height:24px;color:#E9D9CF;">Pursued by Bulldozers</div>
</td></tr>
<tr><td style="background:${C.paper};padding:40px 36px 18px;border-left:1px solid ${C.rule};border-right:1px solid ${C.rule};">
${label(doc.eyebrow)}
<h1 style="margin:10px 0 24px;font-family:${SERIF};font-weight:400;font-size:32px;line-height:38px;color:${C.ink};">${escapeHtml(doc.title)}</h1>
${doc.blocks.map(block).join('\n')}
</td></tr>
<tr><td style="background:${C.paper};padding:0 36px 34px;border-left:1px solid ${C.rule};border-right:1px solid ${C.rule};border-bottom:1px solid ${C.rule};">
<div style="border-top:1px solid ${C.rule};padding-top:18px;font-family:${SERIF};font-size:16px;line-height:24px;color:${C.soft};">Charlie Rogers, 1930 to 2020<br>Painter of the back lanes of Tyneside</div>
</td></tr>
<tr><td style="padding:20px 36px 0;font-family:${SANS};font-size:11px;line-height:18px;letter-spacing:0.5px;color:${C.mute};">
${escapeHtml(footerNote)}<br>
See the paintings at ${escapeHtml(GALLERY)}.<br>
<a href="${SITE}" style="color:${C.red};text-decoration:underline;">www.charlierogers.art</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export function renderEmailText(doc: EmailDoc): string {
  const out: string[] = [doc.title.toUpperCase(), '']
  for (const b of doc.blocks) {
    switch (b.kind) {
      case 'p':
        out.push(b.text, '')
        break
      case 'lines':
        for (const r of b.rows) out.push(r.total ? `${r.label}: ${r.value}` : `${r.label}, ${r.value}`)
        out.push('')
        break
      case 'panel':
        out.push(b.title ? `${b.title}: ${b.text}` : b.text, '')
        break
      case 'details':
        out.push(`${b.title}:`, ...b.lines.filter(Boolean), '')
        break
      case 'quote':
        out.push(...b.text.split('\n').map((l) => `> ${l}`), '')
        break
      case 'button':
        out.push(`${b.label}: ${b.href}`, '')
        break
    }
  }
  out.push('Charlie Rogers, Pursued by Bulldozers', SITE)
  return out.join('\n')
}
