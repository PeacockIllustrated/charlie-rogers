import { redirect } from 'next/navigation'
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server'
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

  return (
    <div className="flex min-h-screen bg-paper-warm">
      <AdminSidebar userEmail={user.email ?? 'Signed in'} />
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10 max-w-5xl">{children}</main>
      </div>
    </div>
  )
}
