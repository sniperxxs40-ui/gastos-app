'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { incomeSchema, IncomeInput } from '@/lib/validators'
import { formatDateInput } from '@/lib/utils'

interface IncomeFormProps {
    onSubmit: (data: IncomeInput) => void
    loading: boolean
    initialData?: Partial<IncomeInput>
}

const COMMON_SOURCES = [
    'Sueldo',
    'Freelance',
    'Bono',
    'Arriendo',
    'Inversiones',
    'Regalo',
    'Venta',
    'Reembolso',
    'Otro',
]

export function IncomeForm({
    onSubmit,
    loading,
    initialData,
}: IncomeFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IncomeInput>({
        resolver: zodResolver(incomeSchema),
        defaultValues: {
            amount: initialData?.amount ?? 0,
            currency: initialData?.currency ?? 'CLP',
            source: initialData?.source ?? '',
            income_date: initialData?.income_date ?? formatDateInput(new Date()),
            is_recurring: initialData?.is_recurring ?? false,
            description: initialData?.description,
            frequency: initialData?.frequency,
            is_primary: initialData?.is_primary ?? false,
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

            {/* Source */}
            <div>
                <label className="input-label">Fuente *</label>
                <select {...register('source')} className="input-field">
                    <option value="">Seleccionar fuente...</option>
                    {COMMON_SOURCES.map((src) => (
                        <option key={src} value={src}>
                            {src}
                        </option>
                    ))}
                </select>
                {errors.source && (
                    <p className="input-error">{errors.source.message}</p>
                )}
            </div>

            {/* Date */}
            <div>
                <label className="input-label">Fecha *</label>
                <input
                    {...register('income_date')}
                    type="date"
                    className="input-field"
                />
                {errors.income_date && (
                    <p className="input-error">{errors.income_date.message}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="input-label">Descripción</label>
                <input
                    {...register('description')}
                    type="text"
                    placeholder="Ej: Sueldo mes de enero"
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
                    Es un ingreso recurrente
                </label>
            </div>

            {/* Recurring Fields */}
            {isRecurring && (
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4 animate-fadeIn">
                    <div>
                        <label className="input-label">Frecuencia *</label>
                        <select {...register('frequency')} className="input-field">
                            <option value="">Seleccionar...</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                            <option value="yearly">Anual</option>
                        </select>
                        {errors.frequency && (
                            <p className="input-error">{errors.frequency.message}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Primary Income Toggle */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-3">
                    <input
                        {...register('is_primary')}
                        type="checkbox"
                        id="is_primary"
                        className="w-5 h-5 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                    />
                    <label htmlFor="is_primary" className="text-white font-medium cursor-pointer">
                        Es mi sueldo principal
                    </label>
                </div>
                <p className="text-[var(--text-muted)] text-sm pl-8">
                    Este monto se usará como tu presupuesto mensual base
                </p>
            </div>

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
                        <span>{initialData ? 'Actualizar ingreso' : 'Crear ingreso'}</span>
                    )}
                </button>
            </div>
        </form>
    )
}
