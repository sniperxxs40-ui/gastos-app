/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoadingSkeleton } from '../loading-skeleton'

describe('LoadingSkeleton', () => {
    it('should render text skeleton with correct count', () => {
        const { container } = render(<LoadingSkeleton variant="text" count={3} />)
        const skeletons = container.querySelectorAll('[data-testid="skeleton-text"]')
        expect(skeletons).toHaveLength(3)
    })

    it('should render card skeleton', () => {
        const { container } = render(<LoadingSkeleton variant="card" />)
        const skeleton = container.querySelector('[data-testid="skeleton-card"]')
        expect(skeleton).toBeInTheDocument()
    })

    it('should render table skeleton with correct rows', () => {
        const { container } = render(<LoadingSkeleton variant="table" count={5} />)
        const skeletons = container.querySelectorAll('[data-testid="skeleton-table-row"]')
        expect(skeletons).toHaveLength(5)
    })

    it('should render circular skeleton', () => {
        const { container } = render(<LoadingSkeleton variant="circular" />)
        const skeleton = container.querySelector('[data-testid="skeleton-circular"]')
        expect(skeleton).toBeInTheDocument()
    })

    it('should have animate-pulse class for all variants', () => {
        const { container } = render(<LoadingSkeleton variant="text" />)
        const animatedElement = container.querySelector('.animate-pulse')
        expect(animatedElement).toBeInTheDocument()
    })
})
