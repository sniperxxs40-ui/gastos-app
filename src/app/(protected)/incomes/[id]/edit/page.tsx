'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { IncomeForm } from '@/components/incomes/IncomeForm'
import { Income } from '@/lib/types'
import { IncomeInput } from '@/lib/validators'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface EditIncomePageProps {
    params: Promise<{ id: string }>
}

export default function EditIncomePage({ params }: EditIncomePageProps) {
    const { id } = use(params)
    const router = useRouter()
    const [income, setIncome] = useState<Income | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchIncome = async () => {
            try {
                const response = await fetch(`/api/incomes/${id}`)
                const data = await response.json()

                if (!response.ok) {
                    setError('Ingreso no encontrado')
                } else {
                    setIncome(data.data)
                }
            } catch (error) {
                console.error('Error fetching income:', error)
                setError('Error al cargar los datos')
            } finally {
                setLoading(false)
            }
        }

        fetchIncome()
    }, [id])

    const handleSubmit = async (data: IncomeInput) => {
        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`/api/incomes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Error al actualizar el ingreso')
                return
            }

            router.push('/incomes')
        } catch (error) {
            console.error('Error updating income:', error)
            setError('Error inesperado al actualizar el ingreso')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    if (!income || error === 'Ingreso no encontrado') {
        return (
            <div className="max-w-2xl mx-auto animate-fadeIn">
                <Link
                    href="/incomes"
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a ingresos</span>
                </Link>
                <div className="glass-card p-6 text-center">
                    <p className="text-[var(--text-secondary)]">Ingreso no encontrado</p>
                </div>
            </div>
        )
    }

    const initialData: Partial<IncomeInput> = {
        amount: income.amount,
        currency: income.currency,
        source: income.source,
        income_date: income.income_date,
        description: income.description || undefined,
        is_recurring: income.is_recurring,
        frequency: income.frequency || undefined,
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
                <h1 className="text-2xl font-bold text-white">Editar ingreso</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Modifica los datos del ingreso
                </p>
            </div>

            {/* Form */}
            <div className="glass-card p-6">
                {error && error !== 'Ingreso no encontrado' && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <IncomeForm
                    onSubmit={handleSubmit}
                    loading={submitting}
                    initialData={initialData}
                />
            </div>
        </div>
    )
}
