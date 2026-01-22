'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IncomeForm } from '@/components/incomes/IncomeForm'
import { IncomeInput } from '@/lib/validators'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewIncomePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (data: IncomeInput) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/incomes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Error al crear el ingreso')
                return
            }

            router.push('/incomes')
        } catch (error) {
            console.error('Error creating income:', error)
            setError('Error inesperado al crear el ingreso')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/incomes"
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a ingresos</span>
                </Link>
                <h1 className="text-2xl font-bold text-white">Nuevo ingreso</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Registra un nuevo ingreso o sueldo
                </p>
            </div>

            {/* Form */}
            <div className="glass-card p-6">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <IncomeForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}
