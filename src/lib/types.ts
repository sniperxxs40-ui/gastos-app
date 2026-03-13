// Database types matching Supabase schema

export interface Profile {
    id: string
    full_name: string | null
    default_currency: string
    created_at: string
    updated_at: string
}

export interface Category {
    id: string
    user_id: string
    name: string
    color: string | null
    icon: string | null
    created_at: string
    updated_at: string
}

export interface PaymentMethod {
    id: string
    user_id: string
    name: string
    created_at: string
    updated_at: string
}

export interface Expense {
    id: string
    user_id: string
    amount: number
    currency: string
    expense_date: string
    description: string | null
    merchant: string | null
    category_id: string | null
    payment_method_id: string | null
    is_recurring: boolean
    recurring_frequency: 'weekly' | 'monthly' | 'yearly' | null
    recurring_start_date: string | null
    next_occurrence_date: string | null
    recurring_active: boolean
    // Installments (cuotas)
    installments: number | null
    installments_paid: number
    created_at: string
    updated_at: string
}

// Extended types with relations
export interface ExpenseWithRelations extends Expense {
    category: Category | null
    payment_method: PaymentMethod | null
}

// Form types
export interface ExpenseFormData {
    amount: number
    currency: string
    expense_date: string
    description?: string
    merchant?: string
    category_id?: string
    payment_method_id?: string
    is_recurring: boolean
    recurring_frequency?: 'weekly' | 'monthly' | 'yearly'
    recurring_start_date?: string
    // Installments (cuotas)
    is_installment?: boolean
    installments?: number
    total_amount?: number
}

export interface CategoryFormData {
    name: string
    color?: string
    icon?: string
}

export interface PaymentMethodFormData {
    name: string
}

// Report types
export interface SummaryData {
    currentMonth: number
    previousMonth: number
    average: number
    percentageChange: number
}

export interface CategorySummary {
    category_id: string
    category_name: string
    category_color: string | null
    total: number
    percentage: number
}

export interface MonthlyData {
    month: string
    year: number
    total: number
}

// Filter types
export interface ExpenseFilters {
    dateFrom?: string
    dateTo?: string
    categoryId?: string
    paymentMethodId?: string
    isRecurring?: boolean
    search?: string
}

// Income types
export interface Income {
    id: string
    user_id: string
    amount: number
    currency: string
    source: string
    is_recurring: boolean
    frequency: 'weekly' | 'monthly' | 'yearly' | null
    income_date: string
    description: string | null
    created_at: string
    updated_at: string
}

export interface IncomeFormData {
    amount: number
    currency: string
    source: string
    is_recurring: boolean
    frequency?: 'weekly' | 'monthly' | 'yearly'
    income_date: string
    description?: string
    is_primary: boolean
}

export interface IncomeFilters {
    dateFrom?: string
    dateTo?: string
    source?: string
    isRecurring?: boolean
    search?: string
}

// Balance/Report types
export interface BalanceData {
    totalIncomes: number
    totalExpenses: number
    balance: number
    percentageUsed: number
    hasIncomes: boolean
}

export interface DashboardSummaryData extends SummaryData {
    incomesMonth: number
    balance: number
    percentageUsed: number
    hasIncomes: boolean
}
