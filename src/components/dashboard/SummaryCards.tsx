'use client'

import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SummaryData {
    currentMonth: number
    previousMonth: number
    percentageChange: number
    average: number
}

export function SummaryCards({ summary }: { summary: SummaryData }) {
    const isPositiveChange = summary.percentageChange > 0

    const cards = [
        {
            title: 'Mes actual',
            value: formatCurrency(summary.currentMonth),
            icon: DollarSign,
            change: summary.percentageChange,
            changeLabel: 'vs mes anterior',
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            title: 'Mes anterior',
            value: formatCurrency(summary.previousMonth),
            icon: Calendar,
            gradient: 'from-blue-500 to-indigo-500',
        },
        {
            title: 'Promedio mensual',
            value: formatCurrency(summary.average),
            icon: TrendingUp,
            gradient: 'from-purple-500 to-pink-500',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="glass-card glass-card-hover p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[var(--text-secondary)] text-sm font-medium">
                            {card.title}
                        </span>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <p className="text-2xl font-bold text-white mb-1">
                        {card.value}
                    </p>

                    {card.change !== undefined && (
                        <div className="flex items-center gap-2">
                            {isPositiveChange ? (
                                <span className="flex items-center text-red-400 text-sm">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    +{card.change}%
                                </span>
                            ) : (
                                <span className="flex items-center text-emerald-400 text-sm">
                                    <TrendingDown className="w-4 h-4 mr-1" />
                                    {card.change}%
                                </span>
                            )}
                            <span className="text-[var(--text-muted)] text-sm">
                                {card.changeLabel}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
