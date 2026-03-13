import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/expenses/[id]/pay-installment
// Marks the next installment as paid.
// If all installments are paid, marks the expense as inactive (recurring_active = false).
export async function POST(
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

        // Fetch current expense
        const { data: expense, error: fetchError } = await supabase
            .from('expenses')
            .select('id, installments, installments_paid, recurring_active')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !expense) {
            return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
        }

        if (!expense.installments) {
            return NextResponse.json(
                { error: 'Este gasto no es una compra en cuotas' },
                { status: 400 }
            )
        }

        if (expense.installments_paid >= expense.installments) {
            return NextResponse.json(
                { error: 'Todas las cuotas ya han sido pagadas' },
                { status: 400 }
            )
        }

        const newPaid = expense.installments_paid + 1
        const allPaid = newPaid >= expense.installments

        if (allPaid) {
            // Last installment paid → delete the expense entirely
            const { error: deleteError } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)

            if (deleteError) {
                console.error('Error deleting completed installment expense:', deleteError)
                return NextResponse.json({ error: 'Error al finalizar las cuotas' }, { status: 500 })
            }

            return NextResponse.json({
                data: null,
                message: '¡Última cuota pagada! El gasto ha sido saldado completamente y eliminado.',
                allPaid: true,
            })
        }

        // Intermediate payment → increment counter
        const { data, error: updateError } = await supabase
            .from('expenses')
            .update({ installments_paid: newPaid })
            .eq('id', id)
            .select('id, installments, installments_paid, recurring_active')
            .single()

        if (updateError) {
            console.error('Error paying installment:', updateError)
            return NextResponse.json({ error: 'Error al registrar el pago' }, { status: 500 })
        }

        return NextResponse.json({
            data,
            message: `Cuota ${newPaid} de ${expense.installments} registrada.`,
            allPaid: false,
        })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
