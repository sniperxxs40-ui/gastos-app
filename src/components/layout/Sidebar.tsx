'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Receipt,
    Banknote,
    Settings,
    LogOut,
    Wallet
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Gastos', href: '/expenses', icon: Receipt },
    { name: 'Ingresos', href: '/incomes', icon: Banknote },
    { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col z-40">
            {/* Logo */}
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Gastos
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn('nav-item', isActive && 'active')}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <button
                    onClick={handleLogout}
                    className="nav-item w-full text-left hover:text-red-400"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    )
}
