import { createClient } from '@/lib/supabase/server'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { StatisticsChart } from '@/components/dashboard/StatisticsChart'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { BalanceChart } from '@/components/dashboard/BalanceChart'
import { AlertTriangle, Banknote, Target } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
    const supabase = await createClient()

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

    // Get current month expenses total
    const { data: currentMonthExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', currentMonthStart)
        .lte('expense_date', currentMonthEnd)

    const currentMonthExpensesTotal = currentMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

    // Get previous month expenses total
    const { data: previousMonthExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', previousMonthStart)
        .lte('expense_date', previousMonthEnd)

    const previousMonthExpensesTotal = previousMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

    // Get current month incomes total
    const { data: currentMonthIncomes } = await supabase
        .from('incomes')
        .select('amount')
        .gte('income_date', currentMonthStart)
        .lte('income_date', currentMonthEnd)

    const currentMonthIncomesTotal = currentMonthIncomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0

    const hasIncomes = currentMonthIncomesTotal > 0

    // Get primary income for budget (most recent primary income in current month)
    const { data: primaryIncome } = await supabase
        .from('incomes')
        .select('amount')
        .eq('is_primary', true)
        .gte('income_date', currentMonthStart)
        .lte('income_date', currentMonthEnd)
        .order('income_date', { ascending: false })
        .limit(1)
        .single()

    const budgetAmount = primaryIncome?.amount ? Number(primaryIncome.amount) : 0
    const hasBudget = budgetAmount > 0

    // Calculate balance and percentage used (based on budget if available, otherwise total incomes)
    const balance = currentMonthIncomesTotal - currentMonthExpensesTotal
    const budgetBase = hasBudget ? budgetAmount : currentMonthIncomesTotal
    const percentageUsed = budgetBase > 0
        ? Math.round((currentMonthExpensesTotal / budgetBase) * 100)
        : 0

    // Determine budget status
    type BudgetStatus = 'ok' | 'warning' | 'danger'
    let budgetStatus: BudgetStatus = 'ok'
    if (percentageUsed >= 85) {
        budgetStatus = 'danger'
    } else if (percentageUsed >= 70) {
        budgetStatus = 'warning'
    }

    // Get last 6 months data for balance chart
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]

    const { data: monthlyExpenses } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .gte('expense_date', sixMonthsAgo)
        .order('expense_date', { ascending: true })

    const { data: monthlyIncomes } = await supabase
        .from('incomes')
        .select('amount, income_date')
        .gte('income_date', sixMonthsAgo)
        .order('income_date', { ascending: true })

    // Group expenses by month
    const monthlyExpenseTotals: { [key: string]: number } = {}
    monthlyExpenses?.forEach(expense => {
        const date = new Date(expense.expense_date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyExpenseTotals[key] = (monthlyExpenseTotals[key] || 0) + Number(expense.amount)
    })

    // Group incomes by month
    const monthlyIncomeTotals: { [key: string]: number } = {}
    monthlyIncomes?.forEach(income => {
        const date = new Date(income.income_date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyIncomeTotals[key] = (monthlyIncomeTotals[key] || 0) + Number(income.amount)
    })

    // Combine for chart
    const allMonths = new Set([...Object.keys(monthlyExpenseTotals), ...Object.keys(monthlyIncomeTotals)])
    const expenseChartData = Object.entries(monthlyExpenseTotals).map(([month, total]) => ({
        month,
        total,
    })).sort((a, b) => a.month.localeCompare(b.month))

    const balanceChartData = Array.from(allMonths).sort().map(month => ({
        month,
        incomes: monthlyIncomeTotals[month] || 0,
        expenses: monthlyExpenseTotals[month] || 0,
    }))

    // Get expenses by category for current month
    const { data: categoryData } = await supabase
        .from('expenses')
        .select(`
      amount,
      category:categories(id, name, color)
    `)
        .gte('expense_date', currentMonthStart)
        .lte('expense_date', currentMonthEnd)

    type CategoryResult = { id: string; name: string; color: string | null } | null
    const categoryTotals: { [key: string]: { name: string; color: string; total: number } } = {}
    categoryData?.forEach(expense => {
        const rawCategory = expense.category
        const category: CategoryResult = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory
        const key = category?.id || 'sin-categoria'
        const name = category?.name || 'Sin categoría'
        const color = category?.color || '#6b7280'
        if (!categoryTotals[key]) {
            categoryTotals[key] = { name, color, total: 0 }
        }
        categoryTotals[key].total += Number(expense.amount)
    })

    const categoryChartData = Object.entries(categoryTotals)
        .map(([id, data]) => ({
            id,
            name: data.name,
            color: data.color,
            total: data.total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)

    // Get recent expenses
    const { data: recentExpenses } = await supabase
        .from('expenses')
        .select(`
      id,
      amount,
      expense_date,
      description,
      merchant,
      category:categories(name, color, icon)
    `)
        .order('expense_date', { ascending: false })
        .limit(5)

    // Calculate percentage change for expenses
    const percentageChange = previousMonthExpensesTotal === 0
        ? (currentMonthExpensesTotal > 0 ? 100 : 0)
        : Math.round(((currentMonthExpensesTotal - previousMonthExpensesTotal) / previousMonthExpensesTotal) * 100)

    // Calculate average (all time)
    const { data: allExpenses } = await supabase
        .from('expenses')
        .select('amount, expense_date')

    const allTotal = allExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const months = new Set(allExpenses?.map(e => {
        const d = new Date(e.expense_date)
        return `${d.getFullYear()}-${d.getMonth()}`
    })).size || 1
    const average = Math.round(allTotal / months)

    return {
        summary: {
            currentMonth: currentMonthExpensesTotal,
            previousMonth: previousMonthExpensesTotal,
            percentageChange,
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
        recentExpenses: recentExpenses || [],
    }
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function getBudgetStatusMessage(status: 'ok' | 'warning' | 'danger', percentageUsed: number): string {
    if (status === 'danger') return '⚠️ Has superado tu presupuesto'
    if (status === 'warning') return '⚡ Cuidado, estás cerca del límite'
    return '✅ Vas bien este mes'
}

export default async function DashboardPage() {
    const { summary, incomeData, budgetData, expenseChartData, balanceChartData, categoryChartData, recentExpenses } = await getDashboardData()

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Resumen de tus finanzas
                    </p>
                </div>
            </div>

            {/* No incomes alert */}
            {!incomeData.hasIncomes && (
                <div className="glass-card p-4 border-l-4 border-amber-500 bg-amber-500/5">
                    <div className="flex items-center gap-3">
                        <Banknote className="w-6 h-6 text-amber-500" />
                        <div className="flex-1">
                            <p className="text-white font-medium">Aún no has ingresado tu sueldo</p>
                            <p className="text-[var(--text-secondary)] text-sm">
                                Regístralo para ver tu balance real y cuánto dinero te queda disponible.
                            </p>
                        </div>
                        <Link href="/incomes/new" className="btn-gradient text-sm px-4 py-2">
                            Registrar ingreso
                        </Link>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <SummaryCards summary={summary} />

            {/* Income & Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Budget Card - NEW */}
                <div className="glass-card glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[var(--text-secondary)] text-sm font-medium">
                            Presupuesto del mes
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">
                        {budgetData.hasBudget ? formatCurrency(budgetData.budgetAmount) : '--'}
                    </p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        {budgetData.hasBudget ? 'Basado en tu sueldo' : 'Sin sueldo principal'}
                    </p>
                </div>

                {/* Income Card */}
                <div className="glass-card glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[var(--text-secondary)] text-sm font-medium">
                            Ingresos del mes
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <Banknote className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(incomeData.currentMonthIncomes)}
                    </p>
                </div>

                {/* Balance Card */}
                <div className="glass-card glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[var(--text-secondary)] text-sm font-medium">
                            Balance mensual
                        </span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${incomeData.balance >= 0
                            ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                            : 'bg-gradient-to-br from-red-500 to-rose-500'
                            }`}>
                            <span className="text-white font-bold text-sm">
                                {incomeData.balance >= 0 ? '+' : '-'}
                            </span>
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${incomeData.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {formatCurrency(Math.abs(incomeData.balance))}
                    </p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        {incomeData.balance >= 0 ? 'Disponible' : 'Déficit'}
                    </p>
                </div>

                {/* Percentage Used Card - IMPROVED */}
                <div className="glass-card glass-card-hover p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[var(--text-secondary)] text-sm font-medium">
                            % del presupuesto
                        </span>
                        {budgetData.budgetStatus === 'danger' && (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        {budgetData.budgetStatus === 'warning' && (
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                    </div>
                    <div className="flex items-end gap-2">
                        <p className={`text-2xl font-bold ${budgetData.budgetStatus === 'danger' ? 'text-red-400' :
                                budgetData.budgetStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                            {incomeData.hasIncomes || budgetData.hasBudget ? `${incomeData.percentageUsed}%` : '--%'}
                        </p>
                    </div>
                    {/* Progress bar with dynamic colors */}
                    {(incomeData.hasIncomes || budgetData.hasBudget) && (
                        <div className="mt-3 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${budgetData.budgetStatus === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                                        budgetData.budgetStatus === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                            'bg-gradient-to-r from-emerald-500 to-green-500'
                                    }`}
                                style={{ width: `${Math.min(incomeData.percentageUsed, 100)}%` }}
                            />
                        </div>
                    )}
                    {/* Dynamic status message */}
                    {(incomeData.hasIncomes || budgetData.hasBudget) && (
                        <p className={`text-xs mt-2 ${budgetData.budgetStatus === 'danger' ? 'text-red-400' :
                                budgetData.budgetStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                            {getBudgetStatusMessage(budgetData.budgetStatus, incomeData.percentageUsed)}
                        </p>
                    )}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses Chart */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Ingresos vs Gastos</h2>
                    <BalanceChart data={balanceChartData} />
                </div>

                {/* Category Distribution */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Por categoría</h2>
                    <CategoryChart data={categoryChartData} />
                </div>
            </div>

            {/* Monthly Expense Trend */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Tendencia de gastos</h2>
                <StatisticsChart data={expenseChartData} />
            </div>

            {/* Recent Expenses */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Gastos recientes</h2>
                    <a href="/expenses" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                        Ver todos →
                    </a>
                </div>
                <RecentExpenses expenses={recentExpenses} />
            </div>
        </div>
    )
}
