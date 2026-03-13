'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { FiltersBar } from '@/components/expenses/FiltersBar'
import { Pagination } from '@/components/ui/pagination'
import { ExpenseWithRelations, Category, PaymentMethod, ExpenseFilters } from '@/lib/types'

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<ExpenseFilters>({})
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    })

    const fetchExpenses = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('page', pagination.page.toString())
            params.set('limit', pagination.limit.toString())

            if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
            if (filters.dateTo) params.set('dateTo', filters.dateTo)
            if (filters.categoryId) params.set('categoryId', filters.categoryId)
            if (filters.paymentMethodId) params.set('paymentMethodId', filters.paymentMethodId)
            if (filters.isRecurring !== undefined) params.set('isRecurring', filters.isRecurring.toString())
            if (filters.search) params.set('search', filters.search)

            const response = await fetch(`/api/expenses?${params.toString()}`)
            const result = await response.json()

            if (response.ok) {
                setExpenses(result.data)
                setPagination(prev => ({
                    ...prev,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                }))
            } else {
                toast.error('Error al cargar los gastos')
            }
        } catch (error) {
            console.error('Error fetching expenses:', error)
            toast.error('Error al cargar los gastos')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters])

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
            toast.error('Error al cargar las opciones de filtro')
        }
    }

    useEffect(() => {
        fetchMetadata()
    }, [])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return

        try {
            const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
            if (response.ok) {
                toast.success('Gasto eliminado exitosamente')
                fetchExpenses()
            } else {
                toast.error('Error al eliminar el gasto')
            }
        } catch (error) {
            console.error('Error deleting expense:', error)
            toast.error('Error al eliminar el gasto')
        }
    }

    const handlePayInstallment = async (id: string) => {
        try {
            const response = await fetch(`/api/expenses/${id}/pay-installment`, {
                method: 'POST',
            })
            const result = await response.json()

            if (response.ok) {
                if (result.allPaid) {
                    toast.success('🎉 ' + result.message)
                } else {
                    toast.success('✅ ' + result.message)
                }
                fetchExpenses()
            } else {
                toast.error(result.error || 'Error al registrar el pago')
            }
        } catch (error) {
            console.error('Error paying installment:', error)
            toast.error('Error al registrar el pago de cuota')
        }
    }

    const handleFiltersChange = (newFilters: ExpenseFilters) => {
        setFilters(newFilters)
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({})
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gastos</h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        {pagination.total} gastos registrados
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-ghost flex items-center justify-center gap-2 flex-1 sm:flex-initial ${hasActiveFilters ? 'border-emerald-500 text-emerald-400' : ''}`}
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filtros</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                    </button>

                    <Link href="/expenses/new" className="btn-gradient flex items-center justify-center gap-2 flex-1 sm:flex-initial">
                        <Plus className="w-4 h-4" />
                        <span>Nuevo gasto</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="glass-card p-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Filtrar gastos</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-[var(--text-secondary)] hover:text-white flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                    <FiltersBar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        categories={categories}
                        paymentMethods={paymentMethods}
                    />
                </div>
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <ExpenseTable
                    expenses={expenses}
                    loading={loading}
                    onDelete={handleDelete}
                    onPayInstallment={handlePayInstallment}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                    />
                )}
            </div>
        </div>
    )
}
