'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Receipt,
    Banknote,
    Settings,
    LogOut,
    Wallet,
    Menu,
    X
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
    const [mobileOpen, setMobileOpen] = useState(false)
    const [userName, setUserName] = useState<string>('')
    const [userEmail, setUserEmail] = useState<string>('')
    const [userInitial, setUserInitial] = useState<string>('')

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const name = user.user_metadata?.full_name || ''
                const email = user.email || ''
                setUserName(name)
                setUserEmail(email)
                setUserInitial(name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : '?')
            }
        }
        fetchUser()
    }, [supabase.auth])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileOpen])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const sidebarContent = (
        <>
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

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3 mb-4 px-2 cursor-default">
                    <div className="w-8 h-8 rounded-full bg-[#2dd4a8]/20 flex items-center justify-center text-[#2dd4a8] font-semibold flex-shrink-0">
                        {userInitial || <Wallet className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {userName || userEmail.split('@')[0]}
                        </p>
                        {userName ? (
                            <p className="text-xs text-[#7a8ba0] truncate">
                                {userEmail}
                            </p>
                        ) : null}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="nav-item w-full text-left hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="mobile-header md:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-lg text-white hover:bg-[var(--bg-card)] transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Gastos</span>
                </Link>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex-col z-40">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="sidebar-backdrop"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Sidebar Panel */}
                    <aside className="sidebar-mobile">
                        {/* Close Button */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors"
                                aria-label="Cerrar menú"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    )
}
