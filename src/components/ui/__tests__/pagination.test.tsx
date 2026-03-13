import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '../pagination'

describe('Pagination', () => {
    it('renders correctly', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={jest.fn()}
            />
        )

        expect(screen.getByText(/Mostrando/i)).toBeInTheDocument()
        
        // Use getAllByText for "1" because it's in the text and in the button
        const ones = screen.getAllByText('1')
        expect(ones.length).toBeGreaterThan(0)
        
        // For '10' and '50'
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('disables "Anterior" on first page', () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={jest.fn()}
            />
        )

        const prevButtons = screen.getAllByRole('button', { name: /Anterior/i })
        prevButtons.forEach((btn) => {
            expect(btn).toBeDisabled()
        })
    })

    it('disables "Siguiente" on last page', () => {
        render(
            <Pagination
                currentPage={5}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={jest.fn()}
            />
        )

        const nextButtons = screen.getAllByRole('button', { name: /Siguiente/i })
        nextButtons.forEach((btn) => {
            expect(btn).toBeDisabled()
        })
    })

    it('calls onPageChange with correct page', () => {
        const handlePageChange = jest.fn()
        render(
            <Pagination
                currentPage={2}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={handlePageChange}
            />
        )

        // Click on page 3 button (array approach due to multiple sizes/text)
        const page3Buttons = screen.getAllByText('3')
        fireEvent.click(page3Buttons[page3Buttons.length - 1]) // Usually the button
        expect(handlePageChange).toHaveBeenCalledWith(3)

        // Click next (from 2 to 3)
        const nextButtons = screen.getAllByRole('button', { name: /Siguiente/i })
        fireEvent.click(nextButtons[0])
        expect(handlePageChange).toHaveBeenCalledWith(3)
    })
})
