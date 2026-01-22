'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Loader2, CreditCard } from 'lucide-react'
import { PaymentMethod } from '@/lib/types'

interface PaymentMethodsSettingsProps {
    paymentMethods: PaymentMethod[]
    onUpdate: () => void
    loading: boolean
}

export function PaymentMethodsSettings({ paymentMethods, onUpdate, loading }: PaymentMethodsSettingsProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newMethod, setNewMethod] = useState(false)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!name.trim()) return

        setSaving(true)
        setError(null)

        try {
            const response = await fetch('/api/payment-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error)
                return
            }

            setNewMethod(false)
            setName('')
            onUpdate()
        } catch (error) {
            console.error('Error creating payment method:', error)
            setError('Error al crear método de pago')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdate = async (id: string) => {
        if (!name.trim()) return

        setSaving(true)
        setError(null)

        try {
            const response = await fetch('/api/payment-methods', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error)
                return
            }

            setEditingId(null)
            onUpdate()
        } catch (error) {
            console.error('Error updating payment method:', error)
            setError('Error al actualizar método de pago')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este método de pago?')) return

        try {
            const response = await fetch(`/api/payment-methods?id=${id}`, { method: 'DELETE' })
            if (response.ok) {
                onUpdate()
            }
        } catch (error) {
            console.error('Error deleting payment method:', error)
        }
    }

    const startEdit = (method: PaymentMethod) => {
        setEditingId(method.id)
        setName(method.name)
        setNewMethod(false)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setNewMethod(false)
        setName('')
        setError(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Payment Methods List */}
            <div className="space-y-2">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                    >
                        {editingId === method.id ? (
                            /* Edit Mode */
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field flex-1"
                                    placeholder="Nombre del método"
                                />
                                <button
                                    onClick={() => handleUpdate(method.id)}
                                    disabled={saving}
                                    className="btn-gradient py-2 px-4 flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button onClick={cancelEdit} className="btn-ghost py-2 px-4">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">{method.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(method)}
                                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(method.id)}
                                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* New Payment Method Form */}
            {newMethod ? (
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field flex-1"
                            placeholder="Nombre del método de pago"
                            autoFocus
                        />
                        <button
                            onClick={handleCreate}
                            disabled={saving || !name.trim()}
                            className="btn-gradient py-2 px-4 flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Crear
                        </button>
                        <button onClick={cancelEdit} className="btn-ghost py-2 px-4">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setNewMethod(true)
                        setEditingId(null)
                    }}
                    className="w-full p-4 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--text-secondary)] hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Agregar método de pago</span>
                </button>
            )}
        </div>
    )
}
