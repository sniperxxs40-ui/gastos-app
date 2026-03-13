'use client'

import { useState, useEffect, Suspense } from 'react'
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

const authBackground = { background: 'url(/auth-bg.png) center/cover no-repeat fixed, #0b1120' }

function ResetPasswordFormContent() {
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

    useEffect(() => {
        const handleRecovery = async () => {
            const queryToken = searchParams.get('token')
            const queryType = searchParams.get('type')

            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const hashAccessToken = hashParams.get('access_token')
            const hashRefreshToken = hashParams.get('refresh_token')
            const hashType = hashParams.get('type')

            console.log('Reset password page loaded')
            console.log('Query params:', { token: !!queryToken, type: queryType })
            console.log('Hash params:', { accessToken: !!hashAccessToken, type: hashType })

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

            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Ocurrió un error inesperado')
        }
    }


    // Loading state
    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm animate-fadeIn text-center">
                    <Loader2 className="w-12 h-12 text-[#2dd4a8] animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">
                        Verificando enlace...
                    </h2>
                    <p className="text-[#7a8ba0]">
                        Por favor espera un momento
                    </p>
                </div>
            </div>
        )
    }

    // Success state
    if (passwordUpdated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm animate-fadeIn text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2dd4a8]/20 mb-6">
                        <CheckCircle className="w-8 h-8 text-[#2dd4a8]" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                        ¡Contraseña actualizada!
                    </h2>

                    <p className="text-[#7a8ba0] mb-8">
                        Tu contraseña ha sido actualizada correctamente. Redirigiendo al login...
                    </p>

                    <div className="flex items-center justify-center gap-2 text-[#2dd4a8]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Redirigiendo...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-3">
                        <img src="/logo.png" alt="Control de Gastos" width={120} height={120} className="drop-shadow-[0_0_15px_rgba(45,212,168,0.3)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Nueva contraseña</h1>
                    <p className="text-[#7a8ba0] mt-2 text-base">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4a8]" />
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nueva contraseña"
                                className="auth-input pr-14"
                                autoComplete="new-password"
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
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirmar contraseña"
                                className="auth-input pr-14"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2dd4a8] hover:text-[#5eebc5] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !sessionReady}
                            className="auth-btn w-full flex items-center justify-center gap-2"
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
                                <span>Actualizar contraseña</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-8">
                    <Link
                        href="/login"
                        className="text-[#7a8ba0] hover:text-[#a0b0c0] transition-colors text-sm"
                    >
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div style={authBackground}>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Loader2 className="w-12 h-12 text-[#2dd4a8] animate-spin mx-auto" />
                </div>
            }>
                <ResetPasswordFormContent />
            </Suspense>
        </div>
    )
}
