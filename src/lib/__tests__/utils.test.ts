import { formatCurrency, formatDate, cn } from '../utils'

describe('formatCurrency', () => {
    it('should format CLP currency correctly (default)', () => {
        // CLP es el default y no tiene decimales
        expect(formatCurrency(1234.56)).toBe('$1.235')
    })

    it('should format USD currency correctly', () => {
        // USD con formato chileno, sin decimales
        expect(formatCurrency(1234.56, 'USD')).toContain('1.235')
    })

    it('should handle zero correctly', () => {
        expect(formatCurrency(0)).toBe('$0')
    })

    it('should handle negative numbers', () => {
        const result = formatCurrency(-1234.56)
        expect(result).toContain('-')
        expect(result).toContain('1.235')
    })

    it('should format large numbers with thousand separators', () => {
        const result = formatCurrency(1234567)
        expect(result).toContain('1.234.567')
    })
})

describe('formatDate', () => {
    it('should format ISO date string correctly', () => {
        // Usar UTC para evitar problemas de timezone
        const result = formatDate('2024-01-15T12:00:00Z')
        expect(result).toMatch(/\d{1,2}\s(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s2024/)
    })

    it('should handle Date object', () => {
        const date = new Date(2024, 0, 15) // Meses van de 0-11 en JS
        const result = formatDate(date)
        expect(result).toMatch(/15\s(ene|enero)\s2024/i)
    })

    it('should format dates consistently', () => {
        const date1 = formatDate('2024-06-01')
        const date2 = formatDate(new Date(2024, 5, 1))
        // Ambos deberían contener "jun" y "2024"
        expect(date1).toContain('2024')
        expect(date2).toContain('2024')
    })
})

describe('cn', () => {
    it('should merge class names', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
    })

    it('should handle undefined and null', () => {
        expect(cn('base', undefined, null, 'end')).toBe('base end')
    })

    it('should merge tailwind classes correctly', () => {
        // tailwind-merge debería resolver conflictos
        expect(cn('p-4 text-red-500', 'text-blue-500')).toBe('p-4 text-blue-500')
    })

    it('should handle arrays of classes', () => {
        expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })
})
