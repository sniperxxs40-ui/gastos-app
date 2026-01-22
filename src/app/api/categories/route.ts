import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorySchema } from '@/lib/validators'

// GET /api/categories - List categories
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// POST /api/categories - Create category
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()

        // Validate input
        const validationResult = categorySchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({
                ...validationResult.data,
                user_id: user.id,
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Ya existe una categoría con ese nombre' },
                    { status: 400 }
                )
            }
            console.error('Error creating category:', error)
            return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// PUT /api/categories - Update category (expects id in body)
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
        const validationResult = categorySchema.safeParse(updateData)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('categories')
            .update(validationResult.data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Ya existe una categoría con ese nombre' },
                    { status: 400 }
                )
            }
            console.error('Error updating category:', error)
            return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// DELETE /api/categories - Delete category (expects id in query)
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
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting category:', error)
            return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
