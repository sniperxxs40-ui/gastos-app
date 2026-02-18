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

                // Mensajes de error más específicos
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

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fadeIn">
                    <div className="glass-card p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">
                            Revisa tu correo
                        </h2>

                        <p className="text-[var(--text-secondary)] mb-2">
                            Hemos enviado un enlace de recuperación a:
                        </p>
                        <p className="text-emerald-400 font-medium mb-6">
                            {submittedEmail}
                        </p>

                        <p className="text-[var(--text-secondary)] text-sm mb-8">
                            Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                        </p>

                        <Link
                            href="/login"
                            className="btn-secondary w-full flex items-center justify-center gap-2"
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Ingresa tu email y te enviaremos instrucciones para recuperarla
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="input-error">{errors.email.message}</p>
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
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    <span>Enviar enlace de recuperación</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-[var(--text-secondary)] hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
