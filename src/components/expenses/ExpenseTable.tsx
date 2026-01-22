'use client'

import Link from 'next/link'
import { Pencil, Trash2, RotateCcw, Loader2 } from 'lucide-react'
import { ExpenseWithRelations } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ExpenseTableProps {
    expenses: ExpenseWithRelations[]
    loading: boolean
    onDelete: (id: string) => void
}

export function ExpenseTable({ expenses, loading, onDelete }: ExpenseTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
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
        <div className="overflow-x-auto">
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
                                    {expense.is_recurring && (
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            <RotateCcw className="w-3 h-3" />
                                            {expense.recurring_frequency === 'weekly' && 'Semanal'}
                                            {expense.recurring_frequency === 'monthly' && 'Mensual'}
                                            {expense.recurring_frequency === 'yearly' && 'Anual'}
                                        </span>
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
    )
}
