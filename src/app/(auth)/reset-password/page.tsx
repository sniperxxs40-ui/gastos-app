'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordUpdated, setPasswordUpdated] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    // Verificar y establecer sesión desde el token de recuperación en la URL
    useEffect(() => {
        const handleRecovery = async () => {
            // 1. Intentar desde query params (?token=xxx&type=recovery)
            const queryToken = searchParams.get('token')
            const queryType = searchParams.get('type')

            // 2. Intentar desde hash params (#access_token=xxx&type=recovery)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const hashAccessToken = hashParams.get('access_token')
            const hashRefreshToken = hashParams.get('refresh_token')
            const hashType = hashParams.get('type')

            console.log('Reset password page loaded')
            console.log('Query params:', { token: !!queryToken, type: queryType })
            console.log('Hash params:', { accessToken: !!hashAccessToken, type: hashType })

            // Caso A: Token viene como query param (Supabase self-hosted / GoTrue)
            if (queryToken && queryType === 'recovery') {
                console.log('Verifying OTP from query token...')
                try {
                    const { data, error } = await supabase.auth.verifyOtp({
                        token_hash: queryToken,
                        type: 'recovery',
                    })
                    if (error) {
                        console.error('Error verifying OTP:', error)
                        toast.error('Token inválido o expirado. Solicita un nuevo enlace.')
                        setCheckingSession(false)
                        setTimeout(() => router.push('/forgot-password'), 2000)
                    } else {
                        console.log('Session established via OTP:', data.session)
                        setSessionReady(true)
                        setCheckingSession(false)
                    }
                } catch (err) {
                    console.error('Exception verifying OTP:', err)
                    toast.error('Error al verificar el token')
                    setCheckingSession(false)
                }
                return
            }

            // Caso B: Token viene como hash param (Supabase Cloud)
            if (hashAccessToken && hashType === 'recovery') {
                console.log('Setting session from hash token...')
                const { data, error } = await supabase.auth.setSession({
                    access_token: hashAccessToken,
                    refresh_token: hashRefreshToken || '',
                })
                if (error) {
                    console.error('Error setting session:', error)
                    toast.error('Token inválido o expirado')
                    setCheckingSession(false)
                    router.push('/forgot-password')
                } else {
                    console.log('Session established via hash:', data.session)
                    setSessionReady(true)
                    setCheckingSession(false)
                }
                return
            }

            // Caso C: No hay token válido
            console.log('No recovery token found in URL')
            setCheckingSession(false)
        }

        handleRecovery()
    }, [router, supabase, searchParams])

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            })

            if (error) {
                toast.error('Error al actualizar la contraseña')
                console.error(error)
                return
            }

            setPasswordUpdated(true)
            toast.success('Contraseña actualizada exitosamente')

            // Redirect después de 2 segundos
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Ocurrió un error inesperado')
        }
    }

    // Mostrar loading mientras se establece la sesión
    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fadeIn">
                    <div className="glass-card p-8 text-center">
                        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">
                            Verificando enlace...
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Por favor espera un momento
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (passwordUpdated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fadeIn">
                    <div className="glass-card p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">
                            ¡Contraseña actualizada!
                        </h2>

                        <p className="text-[var(--text-secondary)] mb-8">
                            Tu contraseña ha sido actualizada correctamente. Redirigiendo al login...
                        </p>

                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Redirigiendo...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        Restablecer contraseña
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Password */}
                        <div>
                            <label className="input-label">Nueva contraseña</label>
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
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="input-error">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !sessionReady}
                            className="btn-gradient w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Actualizando...</span>
                                </>
                            ) : !sessionReady ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Preparando...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Actualizar contraseña</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-[var(--text-secondary)] hover:text-white transition-colors text-sm"
                        >
                            Volver al login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
