import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Insight {
    id: string
    type: 'comparison' | 'category' | 'alert' | 'trend' | 'average' | 'projection'
    message: string
    icon: string
    color: 'green' | 'amber' | 'red' | 'blue' | 'purple'
    priority: number
}

export async function GET() {
    try {
        const supabase = await createClient()

        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

        // Days remaining in month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const daysRemaining = daysInMonth - now.getDate()
        const daysPassed = now.getDate()

        // Get current month expenses
        const { data: currentMonthExpenses } = await supabase
            .from('expenses')
            .select('amount, expense_date, category_id')
            .gte('expense_date', currentMonthStart)
            .lte('expense_date', currentMonthEnd)

        const currentMonthTotal = currentMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

        // Get previous month expenses
        const { data: previousMonthExpenses } = await supabase
            .from('expenses')
            .select('amount')
            .gte('expense_date', previousMonthStart)
            .lte('expense_date', previousMonthEnd)

        const previousMonthTotal = previousMonthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

        // Get current month incomes (for budget calculation)
        const { data: currentMonthIncomes } = await supabase
            .from('incomes')
            .select('amount')
            .gte('income_date', currentMonthStart)
            .lte('income_date', currentMonthEnd)

        const currentMonthIncomesTotal = currentMonthIncomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0

        // Get category data for top category
        const { data: categoryData } = await supabase
            .from('expenses')
            .select(`
                amount,
                category:categories(id, name)
            `)
            .gte('expense_date', currentMonthStart)
            .lte('expense_date', currentMonthEnd)

        // Get last 3 months for trend analysis
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0]
        const { data: trendData } = await supabase
            .from('expenses')
            .select('amount, expense_date')
            .gte('expense_date', threeMonthsAgo)
            .lte('expense_date', currentMonthEnd)

        // Process insights
        const insights: Insight[] = []

        // 1. Monthly comparison insight
        if (previousMonthTotal > 0) {
            const difference = currentMonthTotal - previousMonthTotal
            const percentChange = Math.round((Math.abs(difference) / previousMonthTotal) * 100)

            if (difference < 0) {
                insights.push({
                    id: 'comparison-less',
                    type: 'comparison',
                    message: `Este mes gastaste ${formatCurrency(Math.abs(difference))} menos que el anterior 🎉`,
                    icon: '📊',
                    color: 'green',
                    priority: 1
                })
            } else if (difference > 0 && percentChange > 10) {
                insights.push({
                    id: 'comparison-more',
                    type: 'comparison',
                    message: `Este mes llevas ${formatCurrency(difference)} más que el mes pasado`,
                    icon: '📊',
                    color: 'amber',
                    priority: 2
                })
            }
        }

        // 2. Top category insight
        type CategoryResult = { id: string; name: string } | null
        const categoryTotals: { [key: string]: { name: string; total: number } } = {}
        categoryData?.forEach(expense => {
            const rawCategory = expense.category
            const category: CategoryResult = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory
            const key = category?.id || 'sin-categoria'
            const name = category?.name || 'Sin categoría'
            if (!categoryTotals[key]) {
                categoryTotals[key] = { name, total: 0 }
            }
            categoryTotals[key].total += Number(expense.amount)
        })

        const sortedCategories = Object.entries(categoryTotals)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.total - a.total)

        if (sortedCategories.length > 0 && currentMonthTotal > 0) {
            const topCategory = sortedCategories[0]
            const percentage = Math.round((topCategory.total / currentMonthTotal) * 100)
            insights.push({
                id: 'top-category',
                type: 'category',
                message: `Tu mayor gasto es ${topCategory.name} (${percentage}% del total)`,
                icon: '🏷️',
                color: 'blue',
                priority: 3
            })
        }

        // 3. Budget alert
        if (currentMonthIncomesTotal > 0) {
            const percentageUsed = Math.round((currentMonthTotal / currentMonthIncomesTotal) * 100)

            if (percentageUsed >= 90) {
                insights.push({
                    id: 'budget-critical',
                    type: 'alert',
                    message: `⚠️ Ya usaste ${percentageUsed}% de tu presupuesto`,
                    icon: '🚨',
                    color: 'red',
                    priority: 0
                })
            } else if (percentageUsed >= 75) {
                insights.push({
                    id: 'budget-warning',
                    type: 'alert',
                    message: `Ojo: ya usaste ${percentageUsed}% y faltan ${daysRemaining} días`,
                    icon: '⚠️',
                    color: 'amber',
                    priority: 1
                })
            } else if (percentageUsed <= 50 && daysPassed >= 15) {
                insights.push({
                    id: 'budget-good',
                    type: 'alert',
                    message: `Excelente: solo has usado ${percentageUsed}% a mitad de mes`,
                    icon: '✅',
                    color: 'green',
                    priority: 4
                })
            }
        }

        // 4. Trend analysis (last 3 months)
        const monthlyTotals: { [key: string]: number } = {}
        trendData?.forEach(expense => {
            const date = new Date(expense.expense_date)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(expense.amount)
        })

        const sortedMonths = Object.entries(monthlyTotals)
            .sort(([a], [b]) => a.localeCompare(b))

        if (sortedMonths.length >= 3) {
            const [month1, month2, month3] = sortedMonths.slice(-3).map(([, total]) => total)
            if (month3 < month2 && month2 < month1) {
                insights.push({
                    id: 'trend-positive',
                    type: 'trend',
                    message: '¡Llevas 3 meses gastando menos! Sigue así 🔥',
                    icon: '🔥',
                    color: 'green',
                    priority: 2
                })
            } else if (month3 > month2 && month2 > month1) {
                insights.push({
                    id: 'trend-negative',
                    type: 'trend',
                    message: 'Tus gastos han ido aumentando los últimos meses',
                    icon: '📈',
                    color: 'amber',
                    priority: 3
                })
            }
        }

        // 5. Daily average
        if (daysPassed > 0 && currentMonthTotal > 0) {
            const dailyAverage = Math.round(currentMonthTotal / daysPassed)
            insights.push({
                id: 'daily-average',
                type: 'average',
                message: `Gastas en promedio ${formatCurrency(dailyAverage)} por día`,
                icon: '📈',
                color: 'blue',
                priority: 5
            })

            // 6. End of month projection
            if (currentMonthIncomesTotal > 0) {
                const projectedTotal = dailyAverage * daysInMonth
                const projectedRemaining = currentMonthIncomesTotal - projectedTotal

                if (projectedRemaining > 0) {
                    insights.push({
                        id: 'projection-positive',
                        type: 'projection',
                        message: `A este ritmo terminarás con ${formatCurrency(projectedRemaining)} de sobra`,
                        icon: '💡',
                        color: 'green',
                        priority: 4
                    })
                } else {
                    insights.push({
                        id: 'projection-negative',
                        type: 'projection',
                        message: `A este ritmo te faltarían ${formatCurrency(Math.abs(projectedRemaining))}`,
                        icon: '💡',
                        color: 'red',
                        priority: 2
                    })
                }
            }
        }

        // Sort by priority and limit to 5
        const sortedInsights = insights
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 5)

        return NextResponse.json({
            insights: sortedInsights,
            meta: {
                currentMonthTotal,
                previousMonthTotal,
                currentMonthIncomesTotal,
                daysRemaining,
                daysPassed
            }
        })
    } catch (error) {
        console.error('Error generating insights:', error)
        return NextResponse.json(
            { error: 'Error al generar insights' },
            { status: 500 }
        )
    }
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}
