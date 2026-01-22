import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incomeSchema } from '@/lib/validators'

// GET /api/incomes/[id] - Get single income
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
            .from('incomes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Ingreso no encontrado' }, { status: 404 })
            }
            console.error('Error fetching income:', error)
            return NextResponse.json({ error: 'Error al obtener ingreso' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// PUT /api/incomes/[id] - Update income
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
                .neq('id', id)
        }

        const incomeData = {
            ...validationResult.data,
            frequency: validationResult.data.is_recurring
                ? validationResult.data.frequency
                : null,
        }

        const { data, error } = await supabase
            .from('incomes')
            .update(incomeData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Ingreso no encontrado' }, { status: 404 })
            }
            console.error('Error updating income:', error)
            return NextResponse.json({ error: 'Error al actualizar ingreso' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// DELETE /api/incomes/[id] - Delete income
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
            .from('incomes')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting income:', error)
            return NextResponse.json({ error: 'Error al eliminar ingreso' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
