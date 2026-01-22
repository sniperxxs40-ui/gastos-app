'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { Category, PaymentMethod } from '@/lib/types'
import { ExpenseInput } from '@/lib/validators'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewExpensePage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, pmRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/payment-methods'),
                ])

                const [catData, pmData] = await Promise.all([
                    catRes.json(),
                    pmRes.json(),
                ])

                if (catRes.ok) setCategories(catData.data)
                if (pmRes.ok) setPaymentMethods(pmData.data)
            } catch (error) {
                console.error('Error fetching metadata:', error)
            }
        }

        fetchMetadata()
    }, [])

    const handleSubmit = async (data: ExpenseInput) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Error al crear el gasto')
                return
            }

            router.push('/expenses')
        } catch (error) {
            console.error('Error creating expense:', error)
            setError('Error inesperado al crear el gasto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/expenses"
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a gastos</span>
                </Link>
                <h1 className="text-2xl font-bold text-white">Nuevo gasto</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Registra un nuevo gasto
                </p>
            </div>

            {/* Form */}
            <div className="glass-card p-6">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <ExpenseForm
                    categories={categories}
                    paymentMethods={paymentMethods}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}
