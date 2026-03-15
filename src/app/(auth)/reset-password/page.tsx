import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ResetPasswordForm from './ResetPasswordForm'

const authBackground = { background: 'url(/auth-bg.png) center/cover no-repeat fixed, #0b1120' }

export default function ResetPasswordPage() {
    return (
        <div style={authBackground}>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Loader2 className="w-12 h-12 text-[#2dd4a8] animate-spin mx-auto" />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}
