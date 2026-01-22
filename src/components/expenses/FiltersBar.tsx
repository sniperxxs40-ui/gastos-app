'use client'

import { Category, PaymentMethod, ExpenseFilters } from '@/lib/types'

interface FiltersBarProps {
    filters: ExpenseFilters
    onFiltersChange: (filters: ExpenseFilters) => void
    categories: Category[]
    paymentMethods: PaymentMethod[]
}

export function FiltersBar({
    filters,
    onFiltersChange,
    categories,
    paymentMethods,
}: FiltersBarProps) {
    const handleChange = (key: keyof ExpenseFilters, value: string | boolean | undefined) => {
        onFiltersChange({
            ...filters,
            [key]: value === '' ? undefined : value,
        })
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Date From */}
            <div>
                <label className="input-label">Desde</label>
                <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleChange('dateFrom', e.target.value)}
                    className="input-field"
                />
            </div>

            {/* Date To */}
            <div>
                <label className="input-label">Hasta</label>
                <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleChange('dateTo', e.target.value)}
                    className="input-field"
                />
            </div>

            {/* Category */}
            <div>
                <label className="input-label">Categoría</label>
                <select
                    value={filters.categoryId || ''}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    className="input-field"
                >
                    <option value="">Todas</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Payment Method */}
            <div>
                <label className="input-label">Método de pago</label>
                <select
                    value={filters.paymentMethodId || ''}
                    onChange={(e) => handleChange('paymentMethodId', e.target.value)}
                    className="input-field"
                >
                    <option value="">Todos</option>
                    {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                            {pm.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Search */}
            <div>
                <label className="input-label">Buscar</label>
                <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                    placeholder="Descripción o comercio..."
                    className="input-field"
                />
            </div>
        </div>
    )
}
