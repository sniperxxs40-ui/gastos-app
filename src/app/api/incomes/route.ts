import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incomeSchema } from '@/lib/validators'

// GET /api/incomes - List incomes with filters
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
        const source = searchParams.get('source')
        const isRecurring = searchParams.get('isRecurring')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        let query = supabase
            .from('incomes')
            .select('*', { count: 'exact' })
            .order('income_date', { ascending: false })
            .range(offset, offset + limit - 1)

        if (dateFrom) {
            query = query.gte('income_date', dateFrom)
        }
        if (dateTo) {
            query = query.lte('income_date', dateTo)
        }
        if (source) {
            query = query.eq('source', source)
        }
        if (isRecurring === 'true') {
            query = query.eq('is_recurring', true)
        } else if (isRecurring === 'false') {
            query = query.eq('is_recurring', false)
        }
        if (search) {
            query = query.or(`description.ilike.%${search}%,source.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching incomes:', error)
            return NextResponse.json({ error: 'Error al obtener ingresos' }, { status: 500 })
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

// POST /api/incomes - Create income
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()

        // Validate input
        const validationResult = incomeSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        // If this income is marked as primary, unmark all other primary incomes
        if (validationResult.data.is_primary) {
            await supabase
                .from('incomes')
                .update({ is_primary: false })
                .eq('is_primary', true)
        }

        const incomeData = {
            ...validationResult.data,
            user_id: user.id,
            frequency: validationResult.data.is_recurring
                ? validationResult.data.frequency
                : null,
        }

        const { data, error } = await supabase
            .from('incomes')
            .insert(incomeData)
            .select()
            .single()

        if (error) {
            console.error('Error creating income:', error)
            return NextResponse.json({ error: 'Error al crear ingreso' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
