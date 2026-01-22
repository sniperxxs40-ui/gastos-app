'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
    fullName: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterFormData) => {
        setError(null)

        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                },
            },
        })

        if (error) {
            if (error.message.includes('already registered')) {
                setError('Este email ya está registrado')
            } else {
                setError(error.message)
            }
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Comienza a controlar tus gastos
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="input-label">Nombre completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    {...register('fullName')}
                                    type="text"
                                    placeholder="Juan Pérez"
                                    className="input-field pl-12"
                                    autoComplete="name"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="input-error">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="input-label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="input-field pl-12"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="input-error">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="input-label">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="input-error">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="input-label">Confirmar contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                                <input
                                    {...register('confirmPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-12"
                                    autoComplete="new-password"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="input-error">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-gradient w-full flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creando cuenta...</span>
                                </>
                            ) : (
                                <span>Crear cuenta</span>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-[var(--text-secondary)]">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
