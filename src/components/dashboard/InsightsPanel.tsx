'use client'

import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'

interface Insight {
    id: string
    type: 'comparison' | 'category' | 'alert' | 'trend' | 'average' | 'projection'
    message: string
    icon: string
    color: 'green' | 'amber' | 'red' | 'blue' | 'purple'
    priority: number
}

const colorClasses = {
    green: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20'
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        iconBg: 'bg-amber-500/20'
    },
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        iconBg: 'bg-red-500/20'
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        iconBg: 'bg-blue-500/20'
    },
    purple: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        iconBg: 'bg-purple-500/20'
    }
}

export function InsightsPanel() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchInsights() {
            try {
                const response = await fetch('/api/reports/insights')
                if (response.ok) {
                    const data = await response.json()
                    setInsights(data.insights || [])
                }
            } catch (error) {
                console.error('Error fetching insights:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchInsights()
    }, [])

    if (loading) {
        return (
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Resumen Inteligente</h2>
                        <p className="text-[var(--text-muted)] text-sm">Analizando tus finanzas...</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (insights.length === 0) {
        return null
    }

    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">Resumen Inteligente</h2>
                    <p className="text-[var(--text-muted)] text-sm">Lo que debes saber de tus finanzas</p>
                </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
                {insights.map((insight, index) => {
                    const colors = colorClasses[insight.color]
                    return (
                        <div
                            key={insight.id}
                            className={`
                                flex items-center gap-4 p-4 rounded-xl border
                                transition-all duration-300 hover:translate-x-1
                                ${colors.bg} ${colors.border}
                                animate-fadeIn
                            `}
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            {/* Icon */}
                            <div className={`
                                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                ${colors.iconBg}
                            `}>
                                <span className="text-2xl">{insight.icon}</span>
                            </div>

                            {/* Message */}
                            <p className={`text-base font-medium ${colors.text}`}>
                                {insight.message}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
