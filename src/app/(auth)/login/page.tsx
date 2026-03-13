'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
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
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'url(/auth-bg.png) center/cover no-repeat fixed, #0b1120' }}
        >
            <div className="w-full max-w-sm animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-3">
                        <img src="/logo.png" alt="Control de Gastos" width={120} height={120} className="drop-shadow-[0_0_15px_rgba(45,212,168,0.3)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Control de Gastos</h1>
                    <p className="text-[#7a8ba0] mt-2 text-base">
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Error Alert */}
                    {error && (
                        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="tu@email.com"
                                className="auth-input"
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="auth-input pr-14"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2dd4a8] hover:text-[#5eebc5] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="auth-btn w-full flex items-center justify-center gap-2"
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
                    </div>
                </form>

                {/* Links */}
                <div className="text-center mt-8 space-y-3">
                    <div>
                        <Link
                            href="/forgot-password"
                            className="text-[#7a8ba0] hover:text-[#a0b0c0] transition-colors text-sm"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <div>
                        <Link
                            href="/register"
                            className="text-[#7a8ba0] hover:text-[#a0b0c0] transition-colors text-sm"
                        >
                            Regístrate
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
