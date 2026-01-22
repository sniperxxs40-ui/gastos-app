import { formatCurrency, formatDate } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExpenseRow = Record<string, any>

// Map icon names to components
function getIconComponent(iconName: string | null): LucideIcon {
    if (!iconName) return LucideIcons.CircleDollarSign

    const iconMap: { [key: string]: LucideIcon } = {
        'utensils': LucideIcons.Utensils,
        'car': LucideIcons.Car,
        'home': LucideIcons.Home,
        'heart': LucideIcons.Heart,
        'gamepad-2': LucideIcons.Gamepad2,
        'credit-card': LucideIcons.CreditCard,
        'graduation-cap': LucideIcons.GraduationCap,
        'zap': LucideIcons.Zap,
        'more-horizontal': LucideIcons.MoreHorizontal,
        'shopping-cart': LucideIcons.ShoppingCart,
        'plane': LucideIcons.Plane,
        'gift': LucideIcons.Gift,
        'music': LucideIcons.Music,
        'book': LucideIcons.Book,
        'coffee': LucideIcons.Coffee,
    }

    return iconMap[iconName] || LucideIcons.CircleDollarSign
}

type CategoryData = {
    name: string
    color: string | null
    icon: string | null
} | null

function getCategory(rawCategory: unknown): CategoryData {
    if (!rawCategory) return null
    if (Array.isArray(rawCategory)) {
        return rawCategory[0] as CategoryData
    }
    return rawCategory as CategoryData
}

export function RecentExpenses({ expenses }: { expenses: ExpenseRow[] }) {
    if (expenses.length === 0) {
        return (
            <div className="text-center py-8 text-[var(--text-muted)]">
                No hay gastos registrados
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => {
                const category = getCategory(expense.category)
                const IconComponent = getIconComponent(category?.icon || null)
                const categoryColor = category?.color || '#6b7280'

                return (
                    <div
                        key={expense.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--border-accent)] transition-colors"
                    >
                        {/* Icon */}
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${categoryColor}20` }}
                        >
                            <IconComponent
                                className="w-6 h-6"
                                style={{ color: categoryColor }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                                {expense.description || expense.merchant || 'Sin descripción'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <span>{category?.name || 'Sin categoría'}</span>
                                <span>•</span>
                                <span>{formatDate(expense.expense_date)}</span>
                            </div>
                        </div>

                        {/* Amount */}
                        <p className="text-white font-semibold flex-shrink-0">
                            {formatCurrency(Number(expense.amount))}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
