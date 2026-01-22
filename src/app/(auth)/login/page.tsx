'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Lock, Eye, EyeOff, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'Credenciales inválidas'
                : error.message)
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
                    <h1 className="text-2xl font-bold text-white">Control de Gastos</h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

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
                                    autoComplete="current-password"
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-gradient w-full flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <span>Iniciar sesión</span>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center mt-6 text-[var(--text-secondary)]">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
