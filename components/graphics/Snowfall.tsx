import { rng } from '@/lib/sketch'

// Snow over a painting of snow. Bensham Road, Third Street and the Monument
// are all snow scenes; Charlie painted winter more than any other season.
// Flakes are placed by a seeded generator so the server and browser agree,
// and they start mid-fall so the scene never begins empty.
export function Snowfall({
  count = 46,
  seed = 11,
  fall = '110vh',
  className = '',
}: {
  count?: number
  seed?: number
  // How far a flake falls before it loops: the height of the scene.
  fall?: string
  className?: string
}) {
  const r = rng(seed)
  const flakes = Array.from({ length: count }, () => {
    const size = 2.5 + r() * 3.5
    const duration = 9 + r() * 10
    return {
      left: r() * 100,
      size,
      duration,
      delay: -r() * duration,
      drift: (r() - 0.5) * 60,
      opacity: 0.45 + r() * 0.45,
    }
  })
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ ['--fall' as string]: fall }}
    >
      {flakes.map((f, i) => (
        <span
          key={i}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            ['--drift' as string]: `${f.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
