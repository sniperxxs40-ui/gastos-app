import {
    getMonthName,
    getCurrentMonthRange,
    getPreviousMonthRange,
    calculatePercentageChange,
} from '../utils'

describe('getMonthName', () => {
    it('should return correct month names for valid indices', () => {
        expect(getMonthName(0)).toBe('Enero')
        expect(getMonthName(5)).toBe('Junio')
        expect(getMonthName(11)).toBe('Diciembre')
    })
})

describe('Month Ranges', () => {
    beforeAll(() => {
        // Mock date to 2024-06-15
        jest.useFakeTimers().setSystemTime(new Date('2024-06-15T12:00:00Z'))
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    describe('getCurrentMonthRange', () => {
        it('should return the first and last day of the current month', () => {
            const range = getCurrentMonthRange()
            
            // June has 30 days. First day is June 1st, last is June 30.
            expect(range.start.getFullYear()).toBe(2024)
            expect(range.start.getMonth()).toBe(5) // June is index 5
            expect(range.start.getDate()).toBe(1)

            expect(range.end.getFullYear()).toBe(2024)
            expect(range.end.getMonth()).toBe(5)
            expect(range.end.getDate()).toBe(30)
        })
    })

    describe('getPreviousMonthRange', () => {
        it('should return the first and last day of the previous month', () => {
            const range = getPreviousMonthRange()
            
            // Previous is May. May has 31 days.
            expect(range.start.getFullYear()).toBe(2024)
            expect(range.start.getMonth()).toBe(4) // May is index 4
            expect(range.start.getDate()).toBe(1)

            expect(range.end.getFullYear()).toBe(2024)
            expect(range.end.getMonth()).toBe(4)
            expect(range.end.getDate()).toBe(31)
        })
    })
})

describe('calculatePercentageChange', () => {
    it('should return 100 when previous is 0 and current > 0', () => {
        expect(calculatePercentageChange(500, 0)).toBe(100)
    })

    it('should return 0 when previous is 0 and current is 0', () => {
        expect(calculatePercentageChange(0, 0)).toBe(0)
    })

    it('should return correct increase percentage', () => {
        expect(calculatePercentageChange(150, 100)).toBe(50) // 50% increase
    })

    it('should return correct decrease percentage', () => {
        expect(calculatePercentageChange(50, 100)).toBe(-50) // 50% decrease
    })

    it('should round correctly', () => {
        expect(calculatePercentageChange(133, 100)).toBe(33)
    })
})
