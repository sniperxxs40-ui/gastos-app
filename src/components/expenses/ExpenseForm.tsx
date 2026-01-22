'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { expenseSchema, ExpenseInput } from '@/lib/validators'
import { Category, PaymentMethod } from '@/lib/types'
import { formatDateInput } from '@/lib/utils'

interface ExpenseFormProps {
    categories: Category[]
    paymentMethods: PaymentMethod[]
    onSubmit: (data: ExpenseInput) => void
    loading: boolean
    initialData?: Partial<ExpenseInput>
}

export function ExpenseForm({
    categories,
    paymentMethods,
    onSubmit,
    loading,
    initialData,
}: ExpenseFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ExpenseInput>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            amount: initialData?.amount ?? 0,
            currency: initialData?.currency ?? 'CLP',
            expense_date: initialData?.expense_date ?? formatDateInput(new Date()),
            is_recurring: initialData?.is_recurring ?? false,
            description: initialData?.description,
            merchant: initialData?.merchant,
            category_id: initialData?.category_id,
            payment_method_id: initialData?.payment_method_id,
            recurring_frequency: initialData?.recurring_frequency,
            recurring_start_date: initialData?.recurring_start_date,
        },
    })

    const isRecurring = watch('is_recurring')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount & Currency Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="input-label">Monto *</label>
                    <input
                        {...register('amount', { valueAsNumber: true })}
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        className="input-field"
                    />
                    {errors.amount && (
                        <p className="input-error">{errors.amount.message}</p>
                    )}
                </div>
                <div>
                    <label className="input-label">Moneda</label>
                    <select {...register('currency')} className="input-field">
                        <option value="CLP">CLP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            {/* Date */}
            <div>
                <label className="input-label">Fecha *</label>
                <input
                    {...register('expense_date')}
                    type="date"
                    className="input-field"
                />
                {errors.expense_date && (
                    <p className="input-error">{errors.expense_date.message}</p>
                )}
            </div>

            {/* Category */}
            <div>
                <label className="input-label">Categoría</label>
                <select {...register('category_id')} className="input-field">
                    <option value="">Sin categoría</option>
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
                <select {...register('payment_method_id')} className="input-field">
                    <option value="">Sin especificar</option>
                    {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                            {pm.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div>
                <label className="input-label">Descripción</label>
                <input
                    {...register('description')}
                    type="text"
                    placeholder="Ej: Compra supermercado"
                    className="input-field"
                />
            </div>

            {/* Merchant */}
            <div>
                <label className="input-label">Comercio</label>
                <input
                    {...register('merchant')}
                    type="text"
                    placeholder="Ej: Lider, Netflix, Uber"
                    className="input-field"
                />
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center gap-3">
                <input
                    {...register('is_recurring')}
                    type="checkbox"
                    id="is_recurring"
                    className="w-5 h-5 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <label htmlFor="is_recurring" className="text-white font-medium cursor-pointer">
                    Es un gasto recurrente
                </label>
            </div>

            {/* Recurring Fields */}
            {isRecurring && (
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4 animate-fadeIn">
                    <div>
                        <label className="input-label">Frecuencia *</label>
                        <select {...register('recurring_frequency')} className="input-field">
                            <option value="">Seleccionar...</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                            <option value="yearly">Anual</option>
                        </select>
                        {errors.recurring_frequency && (
                            <p className="input-error">{errors.recurring_frequency.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="input-label">Fecha de inicio</label>
                        <input
                            {...register('recurring_start_date')}
                            type="date"
                            className="input-field"
                        />
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient flex-1 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <span>{initialData ? 'Actualizar gasto' : 'Crear gasto'}</span>
                    )}
                </button>
            </div>
        </form>
    )
}
