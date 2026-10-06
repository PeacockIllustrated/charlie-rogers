import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

// Share images: the painting on its mount at left, the title set in the
// book's type at right. Drawn at build time from the files in public/, so the
// card always shows the real painting rather than a stock graphic.

export const OG_SIZE = { width: 1200, height: 630 }

const PAPER = '#FAF6EE'
const MOUNT = '#F4EEE2'
const INK = '#1A1916'
const INK_SOFT = '#44423D'
const BENSHAM = '#7A1F1F'
const RULE = '#D9D2C0'

async function font(file: string) {
  return readFile(join(process.cwd(), 'assets/fonts', file))
}

async function dataUrl(publicPath: string): Promise<string> {
  const buf = await readFile(join(process.cwd(), 'public', publicPath))
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

export async function shareImage({
  src,
  width,
  height,
  title,
  detail,
}: {
  src: string
  width: number
  height: number
  title: string
  detail?: string
}) {
  // Fit the painting inside a 600 x 470 window without enlarging it.
  const scale = Math.min(600 / width, 470 / height, 1)
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  const [regular, italic, sans, img] = await Promise.all([
    font('EBGaramond-Regular.ttf'),
    font('EBGaramond-Italic.ttf'),
    font('Jost-Medium.ttf'),
    dataUrl(src),
  ])

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: PAPER }}>
        <div
          style={{
            display: 'flex',
            width: 680,
            height: '100%',
            background: MOUNT,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 30,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} width={w} height={h} alt="" />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '64px 56px 56px 56px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Jost',
              fontSize: 17,
              letterSpacing: 3,
              color: BENSHAM,
            }}
          >
            CHARLIE ROGERS · 1930 TO 2020
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'EB Garamond',
                fontSize: title.length > 34 ? 46 : 58,
                lineHeight: 1.05,
                color: INK,
              }}
            >
              {title}
            </div>
            {detail && (
              <div
                style={{
                  display: 'flex',
                  marginTop: 18,
                  fontFamily: 'EB Garamond Italic',
                  fontSize: 30,
                  color: INK_SOFT,
                }}
              >
                {detail}
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              borderTop: `1px solid ${RULE}`,
              paddingTop: 18,
              fontFamily: 'EB Garamond Italic',
              fontSize: 24,
              color: INK_SOFT,
            }}
          >
            Pursued by Bulldozers
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'EB Garamond', data: regular, weight: 400, style: 'normal' },
        { name: 'EB Garamond Italic', data: italic, weight: 400, style: 'italic' },
        { name: 'Jost', data: sans, weight: 500, style: 'normal' },
      ],
    },
  )
}

// The browser and home-screen icon: the roundel reduced to its ring and
// initials, paper on Bensham red.
export async function iconImage(px: number) {
  const italic = await font('EBGaramond-Italic.ttf')
  const ring = Math.max(1, Math.round(px / 40))
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: BENSHAM,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: px * 0.84,
            height: px * 0.84,
            borderRadius: '50%',
            border: `${ring}px solid ${PAPER}`,
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'EB Garamond Italic',
            fontSize: px * 0.42,
            color: PAPER,
            paddingBottom: px * 0.04,
          }}
        >
          CR
        </div>
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: 'EB Garamond Italic', data: italic, weight: 400, style: 'italic' }],
    },
  )
}
