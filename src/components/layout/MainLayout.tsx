import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CartDrawer } from '@/components/CartDrawer'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated, userName, clearAuth } = useAuthStore()
  const displayName = userName || 'User'

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Brand */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">{t('navbar.brand')}</span>
            </Link>

            {/* Right: Auth buttons or user info */}
            <div className="flex items-center gap-4">

              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="hidden sm:inline-flex"
                  >
                    <Link to="/login">{t('navbar.login')}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">{t('navbar.signUp')}</Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{displayName}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('navbar.logout')}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
    </div>
  )
}
