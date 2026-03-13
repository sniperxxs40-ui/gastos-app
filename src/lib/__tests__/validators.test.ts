import { expenseSchema, incomeSchema, categorySchema } from '../validators'

describe('Validators', () => {

    describe('categorySchema', () => {
        it('validates correct category', () => {
            const data = { name: 'Comida', color: '#ff0000', icon: 'pizza' }
            expect(categorySchema.parse(data)).toEqual(data)
        })

        it('requires a name', () => {
            const result = categorySchema.safeParse({ name: '' })
            expect(result.success).toBe(false)
        })

        it('validates hex colors', () => {
            const result = categorySchema.safeParse({ name: 'Valid', color: 'invalid-color' })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Color inválido')
            }
        })
    })

    describe('incomeSchema', () => {
        const validIncome = {
            amount: 1000,
            currency: 'CLP',
            source: 'Sueldo',
            is_recurring: false,
            income_date: '2024-01-01',
            is_primary: true
        }

        it('validates a standard income', () => {
            expect(incomeSchema.parse(validIncome)).toEqual(validIncome)
        })

        it('requires frequency if recurring', () => {
            const recurringIncome = { ...validIncome, is_recurring: true }
            const result = incomeSchema.safeParse(recurringIncome)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('La frecuencia es requerida para ingresos recurrentes')
            }
        })

        it('accepts recurring with frequency', () => {
            const recurringIncome = { ...validIncome, is_recurring: true, frequency: 'monthly' }
            expect(incomeSchema.safeParse(recurringIncome).success).toBe(true)
        })

        it('requires total amount to be positive', () => {
            const result = incomeSchema.safeParse({ ...validIncome, amount: -100 })
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El monto debe ser mayor a 0')
            }
        })
    })

    describe('expenseSchema', () => {
        const validExpense = {
            amount: 500,
            currency: 'CLP',
            expense_date: '2024-01-01',
            is_recurring: false,
            is_installment: false,
        }

        it('validates standard expense', () => {
            expect(expenseSchema.parse(validExpense)).toEqual(validExpense)
        })

        it('requires frequency if recurring and not an installment', () => {
            const recurring = { ...validExpense, is_recurring: true }
            const result = expenseSchema.safeParse(recurring)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('La frecuencia es requerida para gastos recurrentes')
            }
        })

        it('accepts valid installments', () => {
            const installment = {
                ...validExpense,
                amount: 100, // per installment
                is_installment: true,
                installments: 3,
                total_amount: 300
            }
            expect(expenseSchema.parse(installment)).toEqual(installment)
        })

        it('fails installments if pieces are missing', () => {
            const missingPieces = {
                ...validExpense,
                is_installment: true,
                // installments number missing
                total_amount: 300
            }
            const result = expenseSchema.safeParse(missingPieces)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('installments')
            }
        })

        it('fails installments if total missing', () => {
            const missingTotal = {
                ...validExpense,
                is_installment: true,
                installments: 3,
                // total_amount missing
            }
            const result = expenseSchema.safeParse(missingTotal)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('total_amount')
            }
        })

        it('fails if amount <= 0', () => {
            const negativeAmount = { ...validExpense, amount: 0 }
            const result = expenseSchema.safeParse(negativeAmount)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('El monto debe ser mayor a 0')
            }
        })
    })

})
