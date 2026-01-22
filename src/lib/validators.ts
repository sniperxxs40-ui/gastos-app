import { z } from 'zod'

export const expenseSchema = z.object({
    amount: z.number().positive('El monto debe ser mayor a 0'),
    currency: z.string().min(1, 'La moneda es requerida'),
    expense_date: z.string().min(1, 'La fecha es requerida'),
    description: z.string().optional(),
    merchant: z.string().optional(),
    category_id: z.string().uuid().optional().nullable(),
    payment_method_id: z.string().uuid().optional().nullable(),
    is_recurring: z.boolean(),
    recurring_frequency: z.enum(['weekly', 'monthly', 'yearly']).optional().nullable(),
    recurring_start_date: z.string().optional().nullable(),
}).refine(
    (data) => {
        if (data.is_recurring && !data.recurring_frequency) {
            return false
        }
        return true
    },
    {
        message: 'La frecuencia es requerida para gastos recurrentes',
        path: ['recurring_frequency'],
    }
)

export const categorySchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional().nullable(),
    icon: z.string().optional().nullable(),
})

export const paymentMethodSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(50, 'Máximo 50 caracteres'),
})

export const incomeSchema = z.object({
    amount: z.number().positive('El monto debe ser mayor a 0'),
    currency: z.string().min(1, 'La moneda es requerida'),
    source: z.string().min(1, 'La fuente es requerida').max(100, 'Máximo 100 caracteres'),
    is_recurring: z.boolean(),
    frequency: z.enum(['weekly', 'monthly', 'yearly']).optional().nullable(),
    income_date: z.string().min(1, 'La fecha es requerida'),
    description: z.string().optional(),
    is_primary: z.boolean(),
}).refine(
    (data) => {
        if (data.is_recurring && !data.frequency) {
            return false
        }
        return true
    },
    {
        message: 'La frecuencia es requerida para ingresos recurrentes',
        path: ['frequency'],
    }
)

export type ExpenseInput = z.infer<typeof expenseSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>
export type IncomeInput = z.infer<typeof incomeSchema>
