'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
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
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'url(/auth-bg.png) center/cover no-repeat fixed, #0b1120' }}
        >
            <div className="w-full max-w-sm animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-3">
                        <img src="/logo.png" alt="Control de Gastos" width={120} height={120} className="drop-shadow-[0_0_15px_rgba(45,212,168,0.3)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Crear cuenta</h1>
                    <p className="text-[#7a8ba0] mt-2 text-base">
                        Comienza a controlar tus gastos
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

                    {/* Full Name */}
                    <div>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('fullName')}
                                type="text"
                                placeholder="Nombre completo"
                                className="auth-input"
                                autoComplete="name"
                                suppressHydrationWarning
                            />
                        </div>
                        {errors.fullName && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.fullName.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="tu@email.com"
                                className="auth-input"
                                autoComplete="email"
                                suppressHydrationWarning
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                className="auth-input pr-14"
                                autoComplete="new-password"
                                suppressHydrationWarning
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

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('confirmPassword')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirmar contraseña"
                                className="auth-input"
                                autoComplete="new-password"
                                suppressHydrationWarning
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="auth-btn w-full flex items-center justify-center gap-2"
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
                    </div>
                </form>

                {/* Login Link */}
                <div className="text-center mt-8 space-y-3">
                    <div>
                        <Link
                            href="/login"
                            className="text-[#7a8ba0] hover:text-[#a0b0c0] transition-colors text-sm"
                        >
                            ¿Ya tienes cuenta? <span className="text-[#2dd4a8] hover:text-[#5eebc5]">Inicia sesión</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
