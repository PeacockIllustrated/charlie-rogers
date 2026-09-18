import { redirect } from 'next/navigation'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin-auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isSupabaseConfigured()) redirect('/admin/login')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Signed in, but not on the charlie_admins roster. This is rendered rather
  // than redirected: middleware bounces a signed-in user away from the login
  // page, so redirecting there would loop. Signing out is the only useful
  // action, so that is what is offered.
  if (!(await isAdmin())) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-warm p-6">
        <div className="max-w-reading border-t border-rule pt-8">
          <h1 className="font-serif text-h2">Not authorised</h1>
          <p className="mt-3 font-serif text-body text-ink-soft">
            You are signed in as {user.email ?? 'this account'}, but it is not on
            the admin roster for this project. Access is granted per account by
            an existing administrator, and this is a shared database, so an
            account from another project does not carry over.
          </p>
          <form action="/api/admin/signout" method="post" className="mt-8">
            <button
              type="submit"
              className="inline-block border border-ink-soft px-4 py-2.5 font-sans text-small font-medium text-ink transition-colors hover:bg-ink-soft hover:text-paper"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-paper-warm">
      <AdminSidebar userEmail={user.email ?? 'Signed in'} />
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10 max-w-5xl">{children}</main>
      </div>
    </div>
  )
}
