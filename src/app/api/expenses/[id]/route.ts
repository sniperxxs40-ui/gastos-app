import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { expenseSchema } from '@/lib/validators'

// GET /api/expenses/[id] - Get single expense
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('expenses')
            .select(`
        *,
        category:categories(id, name, color, icon),
        payment_method:payment_methods(id, name)
      `)
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
            }
            console.error('Error fetching expense:', error)
            return NextResponse.json({ error: 'Error al obtener gasto' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
            .update(expenseData)
            .eq('id', id)
            .select(`
        *,
        category:categories(id, name, color, icon),
        payment_method:payment_methods(id, name)
      `)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
            }
            console.error('Error updating expense:', error)
            return NextResponse.json({ error: 'Error al actualizar gasto' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting expense:', error)
            return NextResponse.json({ error: 'Error al eliminar gasto' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
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
