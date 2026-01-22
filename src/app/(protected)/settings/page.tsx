'use client'

import { useState, useEffect } from 'react'
import { Category, PaymentMethod } from '@/lib/types'
import { CategoriesSettings } from '@/components/settings/CategoriesSettings'
import { PaymentMethodsSettings } from '@/components/settings/PaymentMethodsSettings'

type Tab = 'categories' | 'payment-methods'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('categories')
    const [categories, setCategories] = useState<Category[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [catRes, pmRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/payment-methods'),
            ])

            const [catData, pmData] = await Promise.all([
                catRes.json(),
                pmRes.json(),
            ])

            if (catRes.ok) setCategories(catData.data)
            if (pmRes.ok) setPaymentMethods(pmData.data)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const tabs = [
        { id: 'categories' as Tab, label: 'Categorías' },
        { id: 'payment-methods' as Tab, label: 'Métodos de pago' },
    ]

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Configuración</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Administra tus categorías y métodos de pago
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-color)]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-emerald-400'
                                : 'text-[var(--text-secondary)] hover:text-white'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="glass-card p-6">
                {activeTab === 'categories' && (
                    <CategoriesSettings
                        categories={categories}
                        onUpdate={fetchData}
                        loading={loading}
                    />
                )}
                {activeTab === 'payment-methods' && (
                    <PaymentMethodsSettings
                        paymentMethods={paymentMethods}
                        onUpdate={fetchData}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    )
}
