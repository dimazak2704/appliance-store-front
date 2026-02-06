import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ConfirmEmailPage } from './pages/ConfirmEmailPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { NotFoundPage } from './pages/errors/NotFoundPage'
import { ForbiddenPage } from './pages/errors/ForbiddenPage'
import { ServerErrorPage } from './pages/errors/ServerErrorPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <MainLayout>
        <LoginPage />
      </MainLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <MainLayout>
        <RegisterPage />
      </MainLayout>
    ),
  },
  {
    path: '/confirm-email',
    element: (
      <MainLayout>
        <ConfirmEmailPage />
      </MainLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <MainLayout>
        <ForgotPasswordPage />
      </MainLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <MainLayout>
        <ResetPasswordPage />
      </MainLayout>
    ),
  },
  {
    path: '/403',
    element: (
      <MainLayout>
        <ForbiddenPage />
      </MainLayout>
    ),
  },
  {
    path: '/500',
    element: (
      <MainLayout>
        <ServerErrorPage />
      </MainLayout>
    ),
  },
  {
    path: '/',
    element: (
      <MainLayout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <h1 className="text-2xl font-bold">Welcome to Appliance Store</h1>
        </div>
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: (
      <MainLayout>
        <NotFoundPage />
      </MainLayout>
    ),
  },
])

