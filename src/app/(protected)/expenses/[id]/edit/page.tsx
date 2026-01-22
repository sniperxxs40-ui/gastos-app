'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { Category, PaymentMethod, Expense } from '@/lib/types'
import { ExpenseInput } from '@/lib/validators'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface EditExpensePageProps {
    params: Promise<{ id: string }>
}

export default function EditExpensePage({ params }: EditExpensePageProps) {
    const { id } = use(params)
    const router = useRouter()
    const [expense, setExpense] = useState<Expense | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [expenseRes, catRes, pmRes] = await Promise.all([
                    fetch(`/api/expenses/${id}`),
                    fetch('/api/categories'),
                    fetch('/api/payment-methods'),
                ])

                const [expenseData, catData, pmData] = await Promise.all([
                    expenseRes.json(),
                    catRes.json(),
                    pmRes.json(),
                ])

                if (!expenseRes.ok) {
                    setError('Gasto no encontrado')
                } else {
                    setExpense(expenseData.data)
                }

                if (catRes.ok) setCategories(catData.data)
                if (pmRes.ok) setPaymentMethods(pmData.data)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Error al cargar los datos')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const handleSubmit = async (data: ExpenseInput) => {
        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Error al actualizar el gasto')
                return
            }

            router.push('/expenses')
        } catch (error) {
            console.error('Error updating expense:', error)
            setError('Error inesperado al actualizar el gasto')
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

    if (!expense || error === 'Gasto no encontrado') {
        return (
            <div className="max-w-2xl mx-auto animate-fadeIn">
                <Link
                    href="/expenses"
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a gastos</span>
                </Link>
                <div className="glass-card p-6 text-center">
                    <p className="text-[var(--text-secondary)]">Gasto no encontrado</p>
                </div>
            </div>
        )
    }

    const initialData: Partial<ExpenseInput> = {
        amount: expense.amount,
        currency: expense.currency,
        expense_date: expense.expense_date,
        description: expense.description || undefined,
        merchant: expense.merchant || undefined,
        category_id: expense.category_id || undefined,
        payment_method_id: expense.payment_method_id || undefined,
        is_recurring: expense.is_recurring,
        recurring_frequency: expense.recurring_frequency || undefined,
        recurring_start_date: expense.recurring_start_date || undefined,
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
                <h1 className="text-2xl font-bold text-white">Editar gasto</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Modifica los datos del gasto
                </p>
            </div>

            {/* Form */}
            <div className="glass-card p-6">
                {error && error !== 'Gasto no encontrado' && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <ExpenseForm
                    categories={categories}
                    paymentMethods={paymentMethods}
                    onSubmit={handleSubmit}
                    loading={submitting}
                    initialData={initialData}
                />
            </div>
        </div>
    )
}
