import { z } from 'zod'

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('La URL de Supabase debe ser válida'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'La clave anónima de Supabase es requerida'),
})

// Validate environment variables
const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Variables de entorno inválidas. Revisa .env.local')
}

export const env = parsed.data
