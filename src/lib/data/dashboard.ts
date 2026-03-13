import { createClient } from '@/lib/supabase/server'

export type BudgetStatus = 'ok' | 'warning' | 'danger'

export interface DashboardData {
    isEmpty: boolean
    summary: {
        currentMonth: number
        previousMonth: number
        percentageChange: number
        average: number
    }
    incomeData: {
        currentMonthIncomes: number
        balance: number
        percentageUsed: number
        hasIncomes: boolean
    }
    budgetData: {
        budgetAmount: number
        hasBudget: boolean
        budgetStatus: BudgetStatus
        totalExpenses: number
    }
    expenseChartData: { month: string; total: number }[]
    balanceChartData: { month: string; incomes: number; expenses: number }[]
    categoryChartData: { id: string; name: string; color: string; total: number }[]
    recentExpenses: {
        id: string
        amount: number
        expense_date: string
        description: string | null
        merchant: string | null
        category: { name: string; color: string | null; icon: string | null } | { name: string; color: string | null; icon: string | null }[] | null
    }[]
}

function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
}

function groupByMonth(
    items: { amount: number; date: string }[]
): Record<string, number> {
    const totals: Record<string, number> = {}
    items.forEach(({ amount, date }) => {
        const d = new Date(date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        totals[key] = (totals[key] || 0) + Number(amount)
    })
    return totals
}

export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient()

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]

    // Run independent queries in parallel
    const [
        { data: currentMonthExpenses },
        { data: previousMonthExpenses },
        { data: currentMonthIncomes },
        { data: primaryIncome },
        { data: monthlyExpenses },
        { data: monthlyIncomes },
        { data: categoryData },
        { data: recentExpenses },
        { data: allExpenses },
    ] = await Promise.all([
        supabase.from('expenses').select('amount').gte('expense_date', currentMonthStart).lte('expense_date', currentMonthEnd),
        supabase.from('expenses').select('amount').gte('expense_date', previousMonthStart).lte('expense_date', previousMonthEnd),
        supabase.from('incomes').select('amount').gte('income_date', currentMonthStart).lte('income_date', currentMonthEnd),
        supabase.from('incomes').select('amount').eq('is_primary', true).gte('income_date', currentMonthStart).lte('income_date', currentMonthEnd).order('income_date', { ascending: false }).limit(1).single(),
        supabase.from('expenses').select('amount, expense_date').gte('expense_date', sixMonthsAgo).order('expense_date', { ascending: true }),
        supabase.from('incomes').select('amount, income_date').gte('income_date', sixMonthsAgo).order('income_date', { ascending: true }),
        supabase.from('expenses').select('amount, category:categories(id, name, color)').gte('expense_date', currentMonthStart).lte('expense_date', currentMonthEnd),
        supabase.from('expenses').select('id, amount, expense_date, description, merchant, category:categories(name, color, icon)').order('expense_date', { ascending: false }).limit(5),
        supabase.from('expenses').select('amount, expense_date'),
    ])

    // ── Totals ────────────────────────────────────────────────────────────────
    const currentMonthExpensesTotal = currentMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
    const previousMonthExpensesTotal = previousMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
    const currentMonthIncomesTotal = currentMonthIncomes?.reduce((sum, i) => sum + Number(i.amount), 0) ?? 0

    const hasIncomes = currentMonthIncomesTotal > 0
    const budgetAmount = primaryIncome?.amount ? Number(primaryIncome.amount) : 0
    const hasBudget = budgetAmount > 0

    const balance = currentMonthIncomesTotal - currentMonthExpensesTotal
    const percentageUsed = currentMonthIncomesTotal > 0
        ? Math.round((currentMonthExpensesTotal / currentMonthIncomesTotal) * 100)
        : 0

    let budgetStatus: BudgetStatus = 'ok'
    if (percentageUsed >= 85) budgetStatus = 'danger'
    else if (percentageUsed >= 70) budgetStatus = 'warning'

    // ── Charts ────────────────────────────────────────────────────────────────
    const monthlyExpenseTotals = groupByMonth(
        (monthlyExpenses ?? []).map(e => ({ amount: e.amount, date: e.expense_date }))
    )
    const monthlyIncomeTotals = groupByMonth(
        (monthlyIncomes ?? []).map(i => ({ amount: i.amount, date: i.income_date }))
    )

    const expenseChartData = Object.entries(monthlyExpenseTotals)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month))

    const allMonths = new Set([...Object.keys(monthlyExpenseTotals), ...Object.keys(monthlyIncomeTotals)])
    const balanceChartData = Array.from(allMonths).sort().map(month => ({
        month,
        incomes: monthlyIncomeTotals[month] ?? 0,
        expenses: monthlyExpenseTotals[month] ?? 0,
    }))

    // ── Category chart ────────────────────────────────────────────────────────
    type CategoryResult = { id: string; name: string; color: string | null } | null
    const categoryTotals: Record<string, { name: string; color: string; total: number }> = {}

    categoryData?.forEach(expense => {
        const rawCategory = expense.category
        const category: CategoryResult = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory
        const key = category?.id ?? 'sin-categoria'
        const name = category?.name ?? 'Sin categoría'
        const color = category?.color ?? '#6b7280'
        if (!categoryTotals[key]) categoryTotals[key] = { name, color, total: 0 }
        categoryTotals[key].total += Number(expense.amount)
    })

    const categoryChartData = Object.entries(categoryTotals)
        .map(([id, data]) => ({ id, name: data.name, color: data.color, total: data.total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)

    // ── Summary ───────────────────────────────────────────────────────────────
    const allTotal = allExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
    const uniqueMonths = new Set(
        allExpenses?.map(e => {
            const d = new Date(e.expense_date)
            return `${d.getFullYear()}-${d.getMonth()}`
        })
    ).size || 1
    const average = Math.round(allTotal / uniqueMonths)

    const totalExpensesEver = allExpenses?.length ?? 0
    const totalIncomesEver = currentMonthIncomes?.length ?? 0
    const isEmpty = totalExpensesEver === 0 && totalIncomesEver === 0

    return {
        isEmpty,
        summary: {
            currentMonth: currentMonthExpensesTotal,
            previousMonth: previousMonthExpensesTotal,
            percentageChange: calculatePercentageChange(currentMonthExpensesTotal, previousMonthExpensesTotal),
            average,
        },
        incomeData: {
            currentMonthIncomes: currentMonthIncomesTotal,
            balance,
            percentageUsed,
            hasIncomes,
        },
        budgetData: {
            budgetAmount,
            hasBudget,
            budgetStatus,
            totalExpenses: currentMonthExpensesTotal,
        },
        expenseChartData,
        balanceChartData,
        categoryChartData,
        recentExpenses: recentExpenses ?? [],
    }
}
