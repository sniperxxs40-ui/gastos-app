'use client'

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
    id: string
    name: string
    color: string
    total: number
}

interface CategoryChartProps {
    data: CategoryData[]
}

export function CategoryChart({ data }: CategoryChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)]">
                No hay datos para mostrar
            </div>
        )
    }

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0)

    // Transform data for Recharts
    const chartData = data.map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        value: item.total,
    }))

    return (
        <div className="flex flex-col w-full">
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={0}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 22, 35, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 600 }}
                            formatter={(value) => [
                                formatCurrency(Number(value)),
                                'Total'
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 grid grid-cols-2 gap-2">
                {data.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[var(--text-secondary)] truncate">
                            {item.name}
                        </span>
                        <span className="text-white font-medium ml-auto whitespace-nowrap">
                            {Math.round((item.total / totalAmount) * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
