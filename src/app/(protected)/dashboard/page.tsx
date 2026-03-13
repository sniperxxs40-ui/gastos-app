import { getDashboardData } from '@/lib/data/dashboard'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { StatisticsChart } from '@/components/dashboard/StatisticsChart'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { BalanceChart } from '@/components/dashboard/BalanceChart'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { AlertTriangle, Banknote, Target, Settings, PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'



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
    const { isEmpty, summary, incomeData, budgetData, expenseChartData, balanceChartData, categoryChartData, recentExpenses } = await getDashboardData()

    // ── Estado vacío: pantalla de bienvenida ──────────────────
    if (isEmpty) {
        const steps = [
            {
                number: 1,
                icon: Settings,
                title: '¿Ya tienes tus categorías listas?',
                description: 'Revisa las categorías que vienen por defecto (Alimentación, Arriendo, Salud, etc.) o crea las tuyas propias. Las categorías te ayudan a organizar tus gastos.',
                action: { label: 'Ver categorías', href: '/settings' },
                gradient: 'from-purple-500 to-indigo-500',
                bg: 'bg-purple-500/10 border-purple-500/30',
                btnBorder: 'border-purple-400',
                btnText: 'text-purple-300',
                btnHover: 'hover:bg-purple-500/20',
            },
            {
                number: 2,
                icon: Banknote,
                title: 'Registra tu sueldo del mes',
                description: 'Ingresa cuánto dinero recibiste este mes. Así la aplicación puede mostrarte cuánto te queda disponible y si vas bien con tu presupuesto.',
                action: { label: 'Registrar ingreso', href: '/incomes/new' },
                gradient: 'from-emerald-500 to-teal-500',
                bg: 'bg-emerald-500/10 border-emerald-500/30',
                btnBorder: 'border-emerald-400',
                btnText: 'text-emerald-300',
                btnHover: 'hover:bg-emerald-500/20',
            },
            {
                number: 3,
                icon: PlusCircle,
                title: '¡Agrega tu primer gasto!',
                description: 'Anota lo que compraste o pagaste: cuánto fue, en qué categoría entra (por ejemplo "Alimentación") y con qué pagaste. ¡Es muy rápido!',
                action: { label: 'Agregar gasto', href: '/expenses/new' },
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-500/10 border-amber-500/30',
                btnBorder: 'border-amber-400',
                btnText: 'text-amber-300',
                btnHover: 'hover:bg-amber-500/20',
            },
        ]

        return (
            <div className="space-y-8 animate-fadeIn">
                {/* Header de bienvenida */}
                <div className="text-center py-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenida a tu Control de Gastos!</h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
                        Para empezar, sigue estos 3 pasos sencillos. Solo te tomará unos minutos y podrás ver todo tu resumen financiero aquí.
                    </p>
                </div>

                {/* Pasos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className={`glass-card p-6 border ${step.bg} flex flex-col gap-4`}
                        >
                            {/* Número + ícono */}
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                                    <step.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-5xl font-black text-white/20 leading-none select-none">
                                    {step.number}
                                </span>
                            </div>

                            {/* Texto */}
                            <div className="flex-1">
                                <h2 className="text-white font-semibold text-lg mb-2 leading-snug">
                                    {step.title}
                                </h2>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Botón */}
                            <Link
                                href={step.action.href}
                                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm border bg-transparent transition-colors ${step.btnBorder} ${step.btnText} ${step.btnHover}`}
                            >
                                {step.action.label}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Tip adicional */}
                <div className="glass-card p-5 border border-white/10 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-base">💡</span>
                    </div>
                    <div>
                        <p className="text-white font-semibold mb-1">
                            ¿Necesitas ayuda?
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            No te preocupes si te equivocas — puedes editar o borrar cualquier gasto o ingreso cuando quieras.
                            El menú de la izquierda te lleva a todas las secciones.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // ── Dashboard normal (con datos) ──────────────────────────
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Banknote className="w-6 h-6 text-amber-500 shrink-0" />
                        <div className="flex-1">
                            <p className="text-white font-medium">Aún no has ingresado tu sueldo</p>
                            <p className="text-[var(--text-secondary)] text-sm">
                                Regístralo para ver tu balance real y cuánto dinero te queda disponible.
                            </p>
                        </div>
                        <Link href="/incomes/new" className="btn-gradient text-sm px-4 py-2 w-full sm:w-auto text-center">
                            Registrar ingreso
                        </Link>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <SummaryCards summary={summary} />

            {/* Insights Panel */}
            <InsightsPanel />

            {/* Income & Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Budget Card */}
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

                {/* Percentage Used Card */}
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
                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Ingresos vs Gastos</h2>
                    <BalanceChart data={balanceChartData} />
                </div>
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

