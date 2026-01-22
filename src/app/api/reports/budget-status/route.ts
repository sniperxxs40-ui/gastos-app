import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type BudgetStatus = 'ok' | 'warning' | 'danger'

export interface BudgetStatusResponse {
    presupuesto_mensual: number
    total_gastos_mes: number
    porcentaje_usado: number
    estado: BudgetStatus
    has_primary_income: boolean
}

// GET /api/reports/budget-status - Get budget status for current month
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

        // Get primary income (budget)
        const { data: primaryIncome } = await supabase
            .from('incomes')
            .select('amount')
            .eq('is_primary', true)
            .gte('income_date', currentMonthStart)
            .lte('income_date', currentMonthEnd)
            .order('income_date', { ascending: false })
            .limit(1)
            .single()

        const presupuesto_mensual = primaryIncome?.amount ? Number(primaryIncome.amount) : 0
        const has_primary_income = presupuesto_mensual > 0

        // Get total expenses for current month
        const { data: expensesData } = await supabase
            .from('expenses')
            .select('amount')
            .gte('expense_date', currentMonthStart)
            .lte('expense_date', currentMonthEnd)

        const total_gastos_mes = expensesData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

        // Calculate percentage used
        const porcentaje_usado = presupuesto_mensual > 0
            ? Math.round((total_gastos_mes / presupuesto_mensual) * 100 * 100) / 100
            : 0

        // Determine status
        let estado: BudgetStatus = 'ok'
        if (porcentaje_usado >= 85) {
            estado = 'danger'
        } else if (porcentaje_usado >= 70) {
            estado = 'warning'
        }

        const response: BudgetStatusResponse = {
            presupuesto_mensual,
            total_gastos_mes,
            porcentaje_usado,
            estado,
            has_primary_income,
        }

        return NextResponse.json({ data: response })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
