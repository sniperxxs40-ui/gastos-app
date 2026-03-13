'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, RotateCcw, CreditCard, CheckCheck } from 'lucide-react'
import { ExpenseWithRelations } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

interface ExpenseTableProps {
    expenses: ExpenseWithRelations[]
    loading: boolean
    onDelete: (id: string) => void
    onPayInstallment?: (id: string) => Promise<void>
}

export function ExpenseTable({ expenses, loading, onDelete, onPayInstallment }: ExpenseTableProps) {
    const [payingId, setPayingId] = useState<string | null>(null)

    const handlePayInstallment = async (id: string) => {
        if (!onPayInstallment) return
        setPayingId(id)
        try {
            await onPayInstallment(id)
        } finally {
            setPayingId(null)
        }
    }
    if (loading) {
        return (
            <div className="p-6">
                <LoadingSkeleton variant="table" count={5} />
            </div>
        )
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center p-12">
                <p className="text-[var(--text-muted)] mb-4">No hay gastos registrados</p>
                <Link href="/expenses/new" className="btn-gradient inline-block">
                    Crear primer gasto
                </Link>
            </div>
        )
    }

    return (
        <>
            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-[var(--border-color)]">
                {expenses.map((expense) => (
                    <div key={expense.id} className="p-4 space-y-3">
                        {/* Top row: Description + Amount */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                    {expense.description || expense.merchant || 'Sin descripción'}
                                </p>
                                {expense.merchant && expense.description && (
                                    <p className="text-[var(--text-muted)] text-sm truncate">
                                        {expense.merchant}
                                    </p>
                                )}
                            </div>
                            <p className="text-white font-semibold whitespace-nowrap text-lg">
                                {formatCurrency(expense.amount, expense.currency)}
                            </p>
                        </div>

                        {/* Middle row: Date + Category + Method + Recurring */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[var(--text-secondary)] text-sm">
                                {formatDate(expense.expense_date)}
                            </span>
                            <span className="text-[var(--text-muted)]">·</span>
                            {expense.category ? (
                                <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: `${expense.category.color}20`,
                                        color: expense.category.color || '#6b7280'
                                    }}
                                >
                                    {expense.category.name}
                                </span>
                            ) : (
                                <span className="text-[var(--text-muted)] text-sm">Sin categoría</span>
                            )}
                            {expense.payment_method && (
                                <>
                                    <span className="text-[var(--text-muted)]">·</span>
                                    <span className="text-[var(--text-secondary)] text-sm">
                                        {expense.payment_method.name}
                                    </span>
                                </>
                            )}
                            {expense.is_recurring && !expense.installments && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    <RotateCcw className="w-3 h-3" />
                                    {expense.recurring_frequency === 'weekly' && 'Semanal'}
                                    {expense.recurring_frequency === 'monthly' && 'Mensual'}
                                    {expense.recurring_frequency === 'yearly' && 'Anual'}
                                </span>
                            )}
                            {expense.installments && (
                                expense.installments_paid >= expense.installments ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCheck className="w-3 h-3" />
                                        Cuotas completadas
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                        <CreditCard className="w-3 h-3" />
                                        Cuota {expense.installments_paid + 1}/{expense.installments}
                                    </span>
                                )
                            )}
                        </div>

                        {/* Bottom row: Actions */}
                        <div className="flex items-center justify-between gap-1">
                            {/* Pay installment button (mobile) */}
                            {expense.installments && expense.installments_paid < expense.installments && onPayInstallment && (
                                <button
                                    onClick={() => handlePayInstallment(expense.id)}
                                    disabled={payingId === expense.id}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-300 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    {payingId === expense.id ? 'Guardando...' : 'Pagar cuota'}
                                </button>
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                            <Link
                                href={`/expenses/${expense.id}/edit`}
                                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-secondary)] transition-colors"
                                title="Editar"
                            >
                                <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => onDelete(expense.id)}
                                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border-color)]">
                            <th className="text-left p-4 text-[var(--text-secondary)] font-semibold text-sm">
                                Fecha
                            </th>
                            <th className="text-left p-4 text-[var(--text-secondary)] font-semibold text-sm">
                                Descripción
                            </th>
                            <th className="text-left p-4 text-[var(--text-secondary)] font-semibold text-sm">
                                Categoría
                            </th>
                            <th className="text-left p-4 text-[var(--text-secondary)] font-semibold text-sm">
                                Método
                            </th>
                            <th className="text-right p-4 text-[var(--text-secondary)] font-semibold text-sm">
                                Monto
                            </th>
                            <th className="text-right p-4 text-[var(--text-secondary)] font-semibold text-sm w-24">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense) => (
                            <tr
                                key={expense.id}
                                className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card)] transition-colors"
                            >
                                <td className="p-4 text-white whitespace-nowrap">
                                    {formatDate(expense.expense_date)}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">
                                            {expense.description || expense.merchant || 'Sin descripción'}
                                        </span>
                                        {expense.is_recurring && !expense.installments && (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                <RotateCcw className="w-3 h-3" />
                                                {expense.recurring_frequency === 'weekly' && 'Semanal'}
                                                {expense.recurring_frequency === 'monthly' && 'Mensual'}
                                                {expense.recurring_frequency === 'yearly' && 'Anual'}
                                            </span>
                                        )}
                                        {expense.installments && (
                                            expense.installments_paid >= expense.installments ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    <CheckCheck className="w-3 h-3" />
                                                    Cuotas completadas
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                                    <CreditCard className="w-3 h-3" />
                                                    Cuota {expense.installments_paid + 1}/{expense.installments}
                                                </span>
                                            )
                                        )}
                                    </div>
                                    {expense.merchant && expense.description && (
                                        <p className="text-[var(--text-muted)] text-sm mt-0.5">
                                            {expense.merchant}
                                        </p>
                                    )}
                                </td>
                                <td className="p-4">
                                    {expense.category ? (
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: `${expense.category.color}20`,
                                                color: expense.category.color || '#6b7280'
                                            }}
                                        >
                                            {expense.category.name}
                                        </span>
                                    ) : (
                                        <span className="text-[var(--text-muted)]">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-[var(--text-secondary)]">
                                    {expense.payment_method?.name || '-'}
                                </td>
                                <td className="p-4 text-right text-white font-semibold whitespace-nowrap">
                                    {formatCurrency(expense.amount, expense.currency)}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Pay installment button (desktop) */}
                                        {expense.installments && expense.installments_paid < expense.installments && onPayInstallment && (
                                            <button
                                                onClick={() => handlePayInstallment(expense.id)}
                                                disabled={payingId === expense.id}
                                                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-300 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors whitespace-nowrap disabled:opacity-50"
                                                title="Marcar cuota como pagada"
                                            >
                                                <CheckCheck className="w-3.5 h-3.5" />
                                                {payingId === expense.id ? 'Guardando...' : 'Pagar cuota'}
                                            </button>
                                        )}
                                        <Link
                                            href={`/expenses/${expense.id}/edit`}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-secondary)] transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => onDelete(expense.id)}
                                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
