import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reports/balance - Get balance report for current month
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

        // Get total incomes for current month
        const { data: incomesData } = await supabase
            .from('incomes')
            .select('amount')
            .gte('income_date', currentMonthStart)
            .lte('income_date', currentMonthEnd)

        const totalIncomes = incomesData?.reduce((sum, i) => sum + Number(i.amount), 0) || 0

        // Get total expenses for current month
        const { data: expensesData } = await supabase
            .from('expenses')
            .select('amount')
            .gte('expense_date', currentMonthStart)
            .lte('expense_date', currentMonthEnd)

        const totalExpenses = expensesData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

        // Calculate balance and percentage
        const balance = totalIncomes - totalExpenses
        const percentageUsed = totalIncomes > 0
            ? Math.round((totalExpenses / totalIncomes) * 100)
            : 0

        return NextResponse.json({
            data: {
                totalIncomes,
                totalExpenses,
                balance,
                percentageUsed,
                hasIncomes: totalIncomes > 0,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
            }
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
