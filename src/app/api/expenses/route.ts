import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { expenseSchema } from '@/lib/validators'

// GET /api/expenses - List expenses with filters
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')
        const categoryId = searchParams.get('categoryId')
        const paymentMethodId = searchParams.get('paymentMethodId')
        const isRecurring = searchParams.get('isRecurring')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        let query = supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        payment_method:payment_methods(id, name)
      `, { count: 'exact' })
            .order('expense_date', { ascending: false })
            .range(offset, offset + limit - 1)

        if (dateFrom) {
            query = query.gte('expense_date', dateFrom)
        }
        if (dateTo) {
            query = query.lte('expense_date', dateTo)
        }
        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }
        if (paymentMethodId) {
            query = query.eq('payment_method_id', paymentMethodId)
        }
        if (isRecurring === 'true') {
            query = query.eq('is_recurring', true)
        } else if (isRecurring === 'false') {
            query = query.eq('is_recurring', false)
        }
        if (search) {
            query = query.or(`description.ilike.%${search}%,merchant.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching expenses:', error)
            return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 })
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST /api/expenses - Create expense
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()

        // Validate input
        const validationResult = expenseSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const expenseData = {
            ...validationResult.data,
            user_id: user.id,
            category_id: validationResult.data.category_id || null,
            payment_method_id: validationResult.data.payment_method_id || null,
            recurring_frequency: validationResult.data.is_recurring
                ? validationResult.data.recurring_frequency
                : null,
            recurring_start_date: validationResult.data.is_recurring
                ? validationResult.data.recurring_start_date || validationResult.data.expense_date
                : null,
            next_occurrence_date: validationResult.data.is_recurring
                ? calculateNextOccurrence(
                    validationResult.data.expense_date,
                    validationResult.data.recurring_frequency!
                )
                : null,
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert(expenseData)
            .select(`
        *,
        category:categories(id, name, color, icon),
        payment_method:payment_methods(id, name)
      `)
            .single()

        if (error) {
            console.error('Error creating expense:', error)
            return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

function calculateNextOccurrence(date: string, frequency: 'weekly' | 'monthly' | 'yearly'): string {
    const d = new Date(date)

    switch (frequency) {
        case 'weekly':
            d.setDate(d.getDate() + 7)
            break
        case 'monthly':
            d.setMonth(d.getMonth() + 1)
            break
        case 'yearly':
            d.setFullYear(d.getFullYear() + 1)
            break
    }

    return d.toISOString().split('T')[0]
}
