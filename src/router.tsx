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
import { CatalogPage } from './pages/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { ProfileLayout } from './layouts/ProfileLayout'
import { ProfileInfoPage } from './pages/profile/ProfileInfoPage'
import { ProfileSecurityPage } from './pages/profile/ProfileSecurityPage'
import { ProfileOrdersPage } from './pages/profile/ProfileOrdersPage'
import { Navigate } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminManufacturersPage } from './pages/admin/AdminManufacturersPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'

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
    path: '/checkout',
    element: (
      <MainLayout>
        <CheckoutPage />
      </MainLayout>
    ),
  },
  {
    path: '/order-success/:orderId',
    element: (
      <MainLayout>
        <OrderSuccessPage />
      </MainLayout>
    ),
  },
  {
    path: '/',
    element: (
      <MainLayout>
        <CatalogPage />
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
  {
    path: '/profile',
    element: (
      <MainLayout>
        <ProfileLayout />
      </MainLayout>
    ),
    children: [
      {
        path: 'info',
        element: <ProfileInfoPage />
      },
      {
        path: 'security',
        element: <ProfileSecurityPage />
      },
      {
        path: 'orders',
        element: <ProfileOrdersPage />
      },
      {
        index: true,
        element: <Navigate to="info" replace />
      }
    ]
  },
  {
    path: '/admin',
    element: (
      <MainLayout>
        <RequireAuth allowedRoles={['EMPLOYEE', 'ADMIN']} />
      </MainLayout>
    ),
    children: [
      {
        path: 'orders',
        element: <AdminOrdersPage />
      },
      {
        path: 'products',
        element: <AdminProductsPage />
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />
      },
      {
        path: 'manufacturers',
        element: <AdminManufacturersPage />
      },
      {
        path: 'users',
        element: <RequireAuth allowedRoles={['ADMIN']} />,
        children: [
          {
            index: true,
            element: <AdminUsersPage />
          }
        ]
      }
    ]
  }
])
