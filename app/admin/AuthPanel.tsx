// The narrow panel shared by the sign in, forgot password and reset password
// pages, so all three look like the same door.
export function AuthPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-warm px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-serif italic text-2xl">Charlie Rogers</span>
          <p className="mt-2 font-sans text-xs uppercase tracking-eyebrow text-ink-mute">
            Shop admin
          </p>
        </div>
        <div className="border border-rule bg-paper p-8">{children}</div>
      </div>
    </div>
  )
}
