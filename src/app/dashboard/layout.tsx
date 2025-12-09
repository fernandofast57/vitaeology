import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  BookOpen, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Test Diagnostico', href: '/test', icon: ClipboardList },
  { name: 'I Miei Risultati', href: '/results', icon: BarChart3 },
  { name: 'Esercizi', href: '/exercises', icon: BookOpen },
  { name: 'Impostazioni', href: '/settings', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const userFullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-petrol-600 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/dashboard" className="text-2xl font-display font-bold text-white">
              Vitaeology
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-200 hover:bg-petrol-500 hover:text-white transition-colors"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-petrol-500 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
                  <span className="text-petrol-600 font-bold text-sm">
                    {userFullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userFullName}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {user.email}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="p-2 text-gray-300 hover:text-white hover:bg-petrol-500 rounded-lg transition-colors"
                  title="Esci"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-10 flex items-center gap-x-6 bg-petrol-600 px-4 py-4 shadow-sm">
        <button type="button" className="text-white">
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-lg font-display font-bold text-white">Vitaeology</span>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
