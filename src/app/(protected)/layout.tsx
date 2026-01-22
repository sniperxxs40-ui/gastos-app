import { Sidebar } from '@/components/layout/Sidebar'

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Sidebar />
            <main
                style={{ marginLeft: '16rem', minHeight: '100vh', padding: '1.5rem' }}
            >
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
