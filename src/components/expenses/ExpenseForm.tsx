'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, RotateCcw } from 'lucide-react'
import { expenseSchema, ExpenseInput } from '@/lib/validators'
import { Category, PaymentMethod } from '@/lib/types'
import { formatDateInput, formatCurrency } from '@/lib/utils'

interface ExpenseFormProps {
    categories: Category[]
    paymentMethods: PaymentMethod[]
    onSubmit: (data: ExpenseInput) => void
    loading: boolean
    initialData?: Partial<ExpenseInput>
}

/** Returns true if the payment method name looks like a credit card */
function isCreditMethod(name: string): boolean {
    return /cr[eé]dit/i.test(name)
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
        control,
        setValue,
        formState: { errors },
    } = useForm<ExpenseInput>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            amount: initialData?.amount ?? 0,
            currency: initialData?.currency ?? 'CLP',
            expense_date: initialData?.expense_date ?? formatDateInput(new Date()),
            is_recurring: initialData?.is_recurring ?? false,
            is_installment: initialData?.is_installment ?? false,
            description: initialData?.description,
            merchant: initialData?.merchant,
            category_id: initialData?.category_id,
            payment_method_id: initialData?.payment_method_id,
            recurring_frequency: initialData?.recurring_frequency,
            recurring_start_date: initialData?.recurring_start_date,
            installments: initialData?.installments ?? undefined,
            total_amount: initialData?.total_amount ?? undefined,
        },
    })

    // Watched fields
    const isRecurring = useWatch({ control, name: 'is_recurring' })
    const isInstallment = useWatch({ control, name: 'is_installment' })
    const installments = useWatch({ control, name: 'installments' })
    const totalAmount = useWatch({ control, name: 'total_amount' })
    const paymentMethodId = useWatch({ control, name: 'payment_method_id' })

    // Detect if selected payment method is credit
    const selectedMethod = paymentMethods.find((pm) => pm.id === paymentMethodId)
    const isCredit = selectedMethod ? isCreditMethod(selectedMethod.name) : false

    // Calculate per-installment amount live
    const amountPerInstallment =
        isInstallment && installments && totalAmount && installments >= 2
            ? Math.ceil(totalAmount / installments)
            : null

    // When switching away from credit, clear installment fields
    const handlePaymentMethodChange = (value: string) => {
        setValue('payment_method_id', value)
        const method = paymentMethods.find((pm) => pm.id === value)
        if (!method || !isCreditMethod(method.name)) {
            setValue('is_installment', false)
            setValue('installments', undefined)
            setValue('total_amount', undefined)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount & Currency Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="input-label">
                        {isInstallment ? 'Monto total de la compra *' : 'Monto *'}
                    </label>
                    {isInstallment ? (
                        <>
                            <input
                                {...register('total_amount', { valueAsNumber: true })}
                                type="number"
                                step="1"
                                min="0"
                                placeholder="Ej: 400000"
                                className="input-field"
                            />
                            {errors.total_amount && (
                                <p className="input-error">{errors.total_amount.message}</p>
                            )}
                        </>
                    ) : (
                        <>
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
                        </>
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
                <select
                    {...register('payment_method_id')}
                    className="input-field"
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                >
                    <option value="">Sin especificar</option>
                    {paymentMethods.map((pm) => (
                        <option key={pm.id} value={pm.id}>
                            {pm.name}
                        </option>
                    ))}
                </select>

                {/* ── Installment section: shown automatically when credit is selected ── */}
                {isCredit && (
                    <div className="mt-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <p className="text-blue-300 text-sm font-medium">
                                💳 ¿En cuántas cuotas?
                            </p>
                            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                                <input
                                    {...register('is_installment')}
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                    onChange={(e) => {
                                        setValue('is_installment', e.target.checked)
                                        if (!e.target.checked) {
                                            setValue('installments', undefined)
                                            setValue('total_amount', undefined)
                                        }
                                    }}
                                />
                                Compra en cuotas
                            </label>
                        </div>

                        {isInstallment && (
                            <div className="space-y-3 animate-fadeIn">
                                <div>
                                    <label className="input-label">Número de cuotas *</label>
                                    <input
                                        {...register('installments', { valueAsNumber: true })}
                                        type="number"
                                        step="1"
                                        min="2"
                                        max="72"
                                        placeholder="Ej: 3, 6, 12, 24..."
                                        className="input-field"
                                    />
                                    {errors.installments && (
                                        <p className="input-error">{errors.installments.message}</p>
                                    )}
                                </div>

                                {/* Live calculation */}
                                {amountPerInstallment !== null && (
                                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                                        <span className="text-[var(--text-secondary)] text-sm">
                                            Cuota mensual aproximada:
                                        </span>
                                        <span className="text-blue-300 font-bold text-lg">
                                            {formatCurrency(amountPerInstallment)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="input-label">Descripción</label>
                <input
                    {...register('description')}
                    type="text"
                    placeholder="Ej: Refrigerador Samsung"
                    className="input-field"
                />
            </div>

            {/* Merchant */}
            <div>
                <label className="input-label">Comercio</label>
                <input
                    {...register('merchant')}
                    type="text"
                    placeholder="Ej: Ripley, Falabella, Lider"
                    className="input-field"
                />
            </div>

            {/* Recurring Toggle (only when NOT installment) */}
            {!isInstallment && (
                <div>
                    <div className="flex items-center gap-3">
                        <input
                            {...register('is_recurring')}
                            type="checkbox"
                            id="is_recurring"
                            className="w-5 h-5 rounded border-[var(--border-color)] bg-[var(--bg-secondary)] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="is_recurring" className="text-white font-medium cursor-pointer flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-emerald-400" />
                            Es un gasto recurrente (arriendo, Netflix, etc.)
                        </label>
                    </div>

                    {isRecurring && (
                        <div className="mt-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4 animate-fadeIn">
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
