import { ReactNode } from 'react'

interface LoadingSkeletonProps {
    className?: string
    variant?: 'card' | 'text' | 'circular' | 'table'
    count?: number
}

export function LoadingSkeleton({
    className = '',
    variant = 'text',
    count = 1
}: LoadingSkeletonProps) {
    if (variant === 'card') {
        return (
            <div className={`animate-pulse space-y-4 ${className}`}>
                <div data-testid="skeleton-card" className="h-32 bg-white/5 rounded-2xl" />
            </div>
        )
    }

    if (variant === 'circular') {
        return (
            <div className={`animate-pulse ${className}`}>
                <div data-testid="skeleton-circular" className="h-12 w-12 bg-white/5 rounded-full" />
            </div>
        )
    }

    if (variant === 'table') {
        return (
            <div className={`animate-pulse space-y-3 ${className}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} data-testid="skeleton-table-row" className="h-16 bg-white/5 rounded-xl" />
                ))}
            </div>
        )
    }

    // Default: text variant
    return (
        <div className={`animate-pulse space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} data-testid="skeleton-text" className="h-4 bg-white/5 rounded" />
            ))}
        </div>
    )
}
