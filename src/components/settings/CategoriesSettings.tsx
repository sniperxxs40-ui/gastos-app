'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { Category } from '@/lib/types'

interface CategoriesSettingsProps {
    categories: Category[]
    onUpdate: () => void
    loading: boolean
}

const COLORS = [
    '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#6b7280', '#14b8a6',
]

const ICONS = [
    'utensils', 'car', 'home', 'heart', 'gamepad-2',
    'credit-card', 'graduation-cap', 'zap', 'shopping-cart', 'plane',
    'gift', 'music', 'book', 'coffee', 'more-horizontal',
]

export function CategoriesSettings({ categories, onUpdate, loading }: CategoriesSettingsProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newCategory, setNewCategory] = useState(false)
    const [formData, setFormData] = useState({ name: '', color: COLORS[0], icon: ICONS[0] })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!formData.name.trim()) return

        setSaving(true)
        setError(null)

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error)
                return
            }

            setNewCategory(false)
            setFormData({ name: '', color: COLORS[0], icon: ICONS[0] })
            onUpdate()
        } catch (error) {
            console.error('Error creating category:', error)
            setError('Error al crear categoría')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) return

        setSaving(true)
        setError(null)

        try {
            const response = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...formData }),
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error)
                return
            }

            setEditingId(null)
            onUpdate()
        } catch (error) {
            console.error('Error updating category:', error)
            setError('Error al actualizar categoría')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta categoría?')) return

        try {
            const response = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
            if (response.ok) {
                onUpdate()
            }
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    const startEdit = (category: Category) => {
        setEditingId(category.id)
        setFormData({
            name: category.name,
            color: category.color || COLORS[0],
            icon: category.icon || ICONS[0],
        })
        setNewCategory(false)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setNewCategory(false)
        setFormData({ name: '', color: COLORS[0], icon: ICONS[0] })
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

            {/* Category List */}
            <div className="space-y-2">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                    >
                        {editingId === category.id ? (
                            /* Edit Mode */
                            <div className="flex-1 space-y-3">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Nombre de la categoría"
                                />
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-6 h-6 rounded-full transition-transform ${formData.color === color ? 'scale-125 ring-2 ring-white' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleUpdate(category.id)}
                                        disabled={saving}
                                        className="btn-gradient py-2 px-4 flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Guardar
                                    </button>
                                    <button onClick={cancelEdit} className="btn-ghost py-2 px-4">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${category.color}20` }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: category.color || '#6b7280' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">{category.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(category)}
                                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card)] transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
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

            {/* New Category Form */}
            {newCategory ? (
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-emerald-500/30 space-y-3">
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                        placeholder="Nombre de la categoría"
                        autoFocus
                    />
                    <div className="flex gap-2 flex-wrap">
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-6 h-6 rounded-full transition-transform ${formData.color === color ? 'scale-125 ring-2 ring-white' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={saving || !formData.name.trim()}
                            className="btn-gradient py-2 px-4 flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Crear categoría
                        </button>
                        <button onClick={cancelEdit} className="btn-ghost py-2 px-4">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setNewCategory(true)
                        setEditingId(null)
                    }}
                    className="w-full p-4 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--text-secondary)] hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Agregar categoría</span>
                </button>
            )}
        </div>
    )
}
