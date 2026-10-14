import type { Metadata } from 'next'
import LoginForm from '@/app/login/LoginForm'

export const metadata: Metadata = { title: 'Acesso restrito', robots: { index: false, follow: false } }

export default function LoginPage() {
  return <LoginForm />
}
