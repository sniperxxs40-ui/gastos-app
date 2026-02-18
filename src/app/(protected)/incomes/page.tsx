'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { IncomeTable } from '@/components/incomes/IncomeTable'
import { Income } from '@/lib/types'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

function IncomesContent() {
    const searchParams = useSearchParams()

    const [incomes, setIncomes] = useState<Income[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    })

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [source, setSource] = useState(searchParams.get('source') || '')
    const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '')
    const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '')

    const fetchIncomes = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('page', pagination.page.toString())
            params.set('limit', pagination.limit.toString())
            if (search) params.set('search', search)
            if (source) params.set('source', source)
            if (dateFrom) params.set('dateFrom', dateFrom)
            if (dateTo) params.set('dateTo', dateTo)

            const response = await fetch(`/api/incomes?${params}`)
            const data = await response.json()

            if (response.ok) {
                setIncomes(data.data)
                setPagination(data.pagination)
            } else {
                toast.error('Error al cargar los ingresos')
            }
        } catch (error) {
            console.error('Error fetching incomes:', error)
            toast.error('Error al cargar los ingresos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIncomes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, search, source, dateFrom, dateTo])

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este ingreso?')) return

        setDeleting(id)
        try {
            const response = await fetch(`/api/incomes/${id}`, { method: 'DELETE' })
            if (response.ok) {
                toast.success('Ingreso eliminado exitosamente')
                setIncomes(incomes.filter(i => i.id !== id))
            } else {
                toast.error('Error al eliminar el ingreso')
            }
        } catch (error) {
            console.error('Error deleting income:', error)
            toast.error('Error al eliminar el ingreso')
        } finally {
            setDeleting(null)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchIncomes()
    }

    const clearFilters = () => {
        setSearch('')
        setSource('')
        setDateFrom('')
        setDateTo('')
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ingresos</h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Gestiona tus ingresos y sueldo
                    </p>
                </div>
                <Link
                    href="/incomes/new"
                    className="btn-gradient flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo ingreso</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por descripción o fuente..."
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Todas las fuentes</option>
                            <option value="Sueldo">Sueldo</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Bono">Bono</option>
                            <option value="Arriendo">Arriendo</option>
                            <option value="Inversiones">Inversiones</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="input-field"
                            placeholder="Desde"
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="input-field flex-1"
                            placeholder="Hasta"
                        />
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-3 py-2 text-[var(--text-secondary)] hover:text-white"
                        >
                            Limpiar
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="glass-card p-6">
                {loading ? (
                    <LoadingSkeleton variant="table" count={5} />
                ) : (
                    <>
                        <IncomeTable
                            incomes={incomes}
                            onDelete={handleDelete}
                            deleting={deleting}
                        />

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border-color)]">
                                <p className="text-[var(--text-secondary)] text-sm">
                                    Mostrando {incomes.length} de {pagination.total} ingresos
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-white px-3">
                                        {pagination.page} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg disabled:opacity-50"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function IncomesPage() {
    return (
        <Suspense fallback={
            <div className="p-6">
                <LoadingSkeleton variant="table" count={5} />
            </div>
        }>
            <IncomesContent />
        </Suspense>
    )
}
