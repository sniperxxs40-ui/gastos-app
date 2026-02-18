'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { IncomeForm } from '@/components/incomes/IncomeForm'
import { IncomeInput } from '@/lib/validators'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewIncomePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (data: IncomeInput) => {
        setLoading(true)

        try {
            const response = await fetch('/api/incomes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(result.error || 'Error al crear el ingreso')
                return
            }

            toast.success('Ingreso creado exitosamente')
            router.push('/incomes')
        } catch (error) {
            console.error('Error creating income:', error)
            toast.error('Error inesperado al crear el ingreso')
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
                <IncomeForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}
