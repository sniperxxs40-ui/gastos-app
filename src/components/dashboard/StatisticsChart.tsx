'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ChartData {
    month: string
    total: number
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

export function StatisticsChart({ data }: { data: ChartData[] }) {
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
                <AreaChart
                    data={formattedData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Total']}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        className="chart-glow"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
