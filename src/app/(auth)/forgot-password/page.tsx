'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [emailSent, setEmailSent] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                console.error('Error sending recovery email:', error)

                let errorMessage = 'Error al enviar el correo de recuperación'

                if (error.message.includes('User not found')) {
                    errorMessage = 'No existe una cuenta con este email'
                } else if (error.message.includes('rate limit')) {
                    errorMessage = 'Demasiados intentos. Espera unos minutos'
                } else if (error.message.includes('SMTP')) {
                    errorMessage = 'Error de configuración de email. Contacta soporte'
                } else {
                    errorMessage = `Error: ${error.message}`
                }

                toast.error(errorMessage)
                return
            }

            setSubmittedEmail(data.email)
            setEmailSent(true)
            toast.success('Correo de recuperación enviado')
        } catch (error) {
            console.error('Unexpected error:', error)
            toast.error('Ocurrió un error inesperado')
        }
    }

    const authBackground = { background: 'url(/auth-bg.png) center/cover no-repeat fixed, #0b1120' }

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={authBackground}>
                <div className="w-full max-w-sm animate-fadeIn">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2dd4a8]/20 mb-6">
                            <CheckCircle className="w-8 h-8 text-[#2dd4a8]" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                            Revisa tu correo
                        </h2>

                        <p className="text-[#7a8ba0] mb-2">
                            Hemos enviado un enlace de recuperación a:
                        </p>
                        <p className="text-[#2dd4a8] font-medium mb-6">
                            {submittedEmail}
                        </p>

                        <p className="text-[#7a8ba0] text-sm mb-8">
                            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                        </p>

                        <Link
                            href="/login"
                            className="auth-btn inline-flex items-center justify-center gap-2 px-8"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={authBackground}>
            <div className="w-full max-w-sm animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-3">
                        <img src="/logo.png" alt="Control de Gastos" width={120} height={120} className="drop-shadow-[0_0_15px_rgba(45,212,168,0.3)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Recuperar contraseña</h1>
                    <p className="text-[#7a8ba0] mt-2 text-base">
                        Ingresa tu email y te enviaremos instrucciones
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                autoFocus
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-2 ml-5">{errors.email.message}</p>
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
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Enviar enlace de recuperación</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-8">
                    <Link
                        href="/login"
                        className="text-[#7a8ba0] hover:text-[#a0b0c0] transition-colors text-sm inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    )
}
