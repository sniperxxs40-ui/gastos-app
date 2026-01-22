'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface BalanceChartData {
    month: string
    incomes: number
    expenses: number
}

const monthNames: { [key: string]: string } = {
    '01': 'Ene',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dic',
}

function formatMonth(month: string) {
    const [year, m] = month.split('-')
    return `${monthNames[m]} ${year.slice(2)}`
}

export function BalanceChart({ data }: { data: BalanceChartData[] }) {
    const formattedData = data.map(item => ({
        ...item,
        name: formatMonth(item.month),
    }))

    if (formattedData.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                No hay datos para mostrar
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 22, 35, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                        labelStyle={{ color: '#fff', fontWeight: 600 }}
                        formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => (
                            <span style={{ color: '#9ca3af' }}>
                                {value === 'incomes' ? 'Ingresos' : 'Gastos'}
                            </span>
                        )}
                    />
                    <Line
                        type="monotone"
                        dataKey="incomes"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
