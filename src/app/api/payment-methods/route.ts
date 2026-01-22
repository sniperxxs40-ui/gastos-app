import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentMethodSchema } from '@/lib/validators'

// GET /api/payment-methods - List payment methods
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching payment methods:', error)
            return NextResponse.json({ error: 'Error al obtener métodos de pago' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST /api/payment-methods - Create payment method
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()

        // Validate input
        const validationResult = paymentMethodSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('payment_methods')
            .insert({
                ...validationResult.data,
                user_id: user.id,
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Ya existe un método de pago con ese nombre' },
                    { status: 400 }
                )
            }
            console.error('Error creating payment method:', error)
            return NextResponse.json({ error: 'Error al crear método de pago' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// PUT /api/payment-methods - Update payment method
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
        }

        // Validate input
        const validationResult = paymentMethodSchema.safeParse(updateData)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('payment_methods')
            .update(validationResult.data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Ya existe un método de pago con ese nombre' },
                    { status: 400 }
                )
            }
            console.error('Error updating payment method:', error)
            return NextResponse.json({ error: 'Error al actualizar método de pago' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// DELETE /api/payment-methods - Delete payment method
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const id = request.nextUrl.searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
        }

        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting payment method:', error)
            return NextResponse.json({ error: 'Error al eliminar método de pago' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
