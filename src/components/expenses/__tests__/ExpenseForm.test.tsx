import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from '../ExpenseForm'
import { Category, PaymentMethod } from '@/lib/types'

// Mock the validators so React Hook Form always thinks it's valid in these tests
jest.mock('@hookform/resolvers/zod', () => ({
    zodResolver: () => async (data: any) => {
        return {
            values: data,
            errors: {}
        }
    }
}))

const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Comida', color: '#ff0000', user_id: 'user-1', created_at: '', updated_at: '', icon: null },
]

const mockPaymentMethods: PaymentMethod[] = [
    { id: 'pm-1', name: 'Efectivo', user_id: 'user-1', created_at: '', updated_at: '' },
    { id: 'pm-2', name: 'Tarjeta de Crédito', user_id: 'user-1', created_at: '', updated_at: '' },
]

describe('ExpenseForm', () => {

    it('renders basic fields', () => {
        render(
            <ExpenseForm
                categories={mockCategories}
                paymentMethods={mockPaymentMethods}
                onSubmit={jest.fn()}
                loading={false}
            />
        )

        expect(screen.getByText(/Monto \*/i)).toBeInTheDocument()
        expect(screen.getByText(/Fecha \*/i)).toBeInTheDocument()
        
        // Match the <label>
        const textElements = screen.getAllByText(/Categoría/i)
        expect(textElements.length).toBeGreaterThan(0)
        
        const pmElements = screen.getAllByText(/Método de pago/i)
        expect(pmElements.length).toBeGreaterThan(0)
    })

    it('shows recurring fields when checked', async () => {
        render(
            <ExpenseForm
                categories={mockCategories}
                paymentMethods={mockPaymentMethods}
                onSubmit={jest.fn()}
                loading={false}
            />
        )

        // Native checkboxes wrapped with text 
        const recurringCheckbox = screen.getByRole('checkbox', { name: /Es un gasto recurrente/i })
        expect(screen.queryByText(/Frecuencia \*/i)).not.toBeInTheDocument()

        fireEvent.click(recurringCheckbox)

        expect(await screen.findByText(/Frecuencia \*/i)).toBeInTheDocument()
        expect(await screen.findByText(/Fecha de inicio/i)).toBeInTheDocument()
    })

    it('shows installments options when credit method selected', async () => {
        render(
            <ExpenseForm
                categories={mockCategories}
                paymentMethods={mockPaymentMethods}
                onSubmit={jest.fn()}
                loading={false}
            />
        )

        // Find the native select for payment methods by looking at all comboboxes
        // then filtering for the one that has our mock option
        const selects = screen.getAllByRole('combobox')
        // [0] = currency, [1] = category_id, [2] = payment_method_id
        const pmSelect = selects[2]
        
        // Inicialmente no debe estar el texto de cuotas
        expect(screen.queryByText(/¿En cuántas cuotas?/i)).not.toBeInTheDocument()

        if (pmSelect) {
            fireEvent.change(pmSelect, { target: { value: 'pm-2' } })
        }

        expect(await screen.findByText(/¿En cuántas cuotas?/i)).toBeInTheDocument()

        // Activar cuotas
        const installmentsCheckbox = screen.getByRole('checkbox', { name: /Compra en cuotas/i })
        fireEvent.click(installmentsCheckbox)

        expect(await screen.findByText(/Número de cuotas \*/i)).toBeInTheDocument()
        expect(await screen.findByText(/Monto total de la compra \*/i)).toBeInTheDocument()
    })

    it('hides recurring options when installments are active', async () => {
        render(
            <ExpenseForm
                categories={mockCategories}
                paymentMethods={mockPaymentMethods}
                onSubmit={jest.fn()}
                loading={false}
            />
        )

        const pmSelect = screen.getAllByRole('combobox')[2] // currency, category, payment
        if (pmSelect) {
            fireEvent.change(pmSelect, { target: { value: 'pm-2' } })
        }
        
        const installmentsCheckbox = await screen.findByRole('checkbox', { name: /Compra en cuotas/i })
        fireEvent.click(installmentsCheckbox)

        // Recurring option should not be visible anymore
        expect(screen.queryByLabelText(/Es un gasto recurrente/i)).not.toBeInTheDocument()
    })

    it('submits form correctly', async () => {
        const handleSubmit = jest.fn()
        
        render(
            <ExpenseForm
                categories={mockCategories}
                paymentMethods={mockPaymentMethods}
                onSubmit={handleSubmit}
                loading={false}
            />
        )

        // Rellenar datos mínimos
        const amountInput = screen.getByPlaceholderText('0')
        fireEvent.input(amountInput, { target: { value: '1000' } })
        
        const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
        fireEvent.input(dateInput, { target: { value: '2024-01-01' } }) 
        
        // Simular envío
        const submitButton = screen.getByRole('button', { name: /Crear gasto/i })
        
        await waitFor(async () => {
            fireEvent.submit(submitButton)
        })

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1)
        })

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 1000,
                expense_date: '2024-01-01',
            }),
            expect.anything() // evento
        )
    })
})
