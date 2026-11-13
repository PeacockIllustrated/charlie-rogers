import type { ReactNode } from 'react'

// A picture in its frame: dark moulding, gilt slip, cream mount and a cut
// bevel. The styles are in globals.css under "Picture frames". The child is
// the image itself, which fills the bevel at its own proportions.
export function Frame({
  children,
  size = 'md',
  className = '',
}: {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <div className={`frame ${size === 'md' ? '' : `frame-${size}`} ${className}`}>
      <div className="frame-slip">
        <div className="frame-mount">
          <div className="frame-bevel">{children}</div>
        </div>
      </div>
    </div>
  )
}
