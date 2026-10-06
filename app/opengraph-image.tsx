import { shareImage, OG_SIZE } from '@/lib/og'

export const alt = 'Bensham Road, Gateshead, 1970, by Charlie Rogers'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return shareImage({
    src: '/artwork/web/bensham-road-gateshead-1970.jpg',
    width: 1600,
    height: 1073,
    title: 'Pursued by bulldozers',
    detail: 'The paintings of Charlie Rogers',
  })
}
