'use client'

import { Edit2, Trash2, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Income } from '@/lib/types'
import Link from 'next/link'

interface IncomeTableProps {
    incomes: Income[]
    onDelete: (id: string) => void
    deleting: string | null
}

const sourceColors: Record<string, string> = {
    'Sueldo': '#10b981',
    'Freelance': '#3b82f6',
    'Bono': '#f59e0b',
    'Arriendo': '#8b5cf6',
    'Inversiones': '#06b6d4',
    'Regalo': '#ec4899',
    'Venta': '#f97316',
    'Reembolso': '#22c55e',
    'Otro': '#6b7280',
}

export function IncomeTable({ incomes, onDelete, deleting }: IncomeTableProps) {
    if (incomes.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--text-muted)]">
                <p>No hay ingresos registrados</p>
                <p className="text-sm mt-2">
                    Agrega tu primer ingreso para comenzar a ver tu balance
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left py-4 px-4 text-[var(--text-secondary)] font-medium">
                            Fuente
                        </th>
                        <th className="text-left py-4 px-4 text-[var(--text-secondary)] font-medium">
                            Descripción
                        </th>
                        <th className="text-left py-4 px-4 text-[var(--text-secondary)] font-medium">
                            Fecha
                        </th>
                        <th className="text-right py-4 px-4 text-[var(--text-secondary)] font-medium">
                            Monto
                        </th>
                        <th className="text-right py-4 px-4 text-[var(--text-secondary)] font-medium">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {incomes.map((income) => (
                        <tr
                            key={income.id}
                            className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: sourceColors[income.source] || '#6b7280' }}
                                    />
                                    <span className="text-white font-medium">{income.source}</span>
                                    {income.is_recurring && (
                                        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            <RefreshCw className="w-3 h-3" />
                                            {income.frequency === 'monthly' ? 'Mensual' :
                                                income.frequency === 'weekly' ? 'Semanal' : 'Anual'}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-4 text-[var(--text-secondary)]">
                                {income.description || '-'}
                            </td>
                            <td className="py-4 px-4 text-[var(--text-secondary)]">
                                {formatDate(income.income_date)}
                            </td>
                            <td className="py-4 px-4 text-right">
                                <span className="text-emerald-400 font-semibold">
                                    +{formatCurrency(income.amount)}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/incomes/${income.id}/edit`}
                                        className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-white"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => onDelete(income.id)}
                                        disabled={deleting === income.id}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-red-400 disabled:opacity-50"
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
