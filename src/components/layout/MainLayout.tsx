import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { Button, buttonVariants } from '@/components/ui/button'
import { LogOut, User, ClipboardList } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CartDrawer } from '../CartDrawer'
import { Toaster } from '@/components/ui/sonner'
import { ShoppingCart } from 'lucide-react'
import { useCartDrawerStore } from '@/store/useCartDrawerStore'
import { getCart } from '@/api/cart'
import { useQuery } from '@tanstack/react-query'
import { useProductModal } from '@/store/productStore'
import { ProductDetailsDialog } from '@/components/ProductDetailsDialog'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated, name, role, clearAuth } = useAuthStore()
  const displayName = name || 'User'
  const { open: openCart } = useCartDrawerStore()

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  const cartItemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CartDrawer />
      <Toaster />
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
                  <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>

                  {(isAuthenticated && (role === 'EMPLOYEE' || role === 'ADMIN')) && (
                    <div className="hidden sm:flex items-center gap-1">
                      <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" asChild>
                        <Link to="/admin/orders">
                          <ClipboardList className="h-5 w-5" />
                          <span className="hidden lg:inline font-medium">{t('navbar.orders')}</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" asChild>
                        <Link to="/admin/products">
                          <ClipboardList className="h-5 w-5" />
                          <span className="hidden lg:inline font-medium">{t('navbar.products')}</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" asChild>
                        <Link to="/admin/categories">
                          <ClipboardList className="h-5 w-5" />
                          <span className="hidden lg:inline font-medium">{t('navbar.categories')}</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" asChild>
                        <Link to="/admin/manufacturers">
                          <ClipboardList className="h-5 w-5" />
                          <span className="hidden lg:inline font-medium">{t('navbar.manufacturers')}</span>
                        </Link>
                      </Button>
                      {role === 'ADMIN' && (
                        <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" asChild>
                          <Link to="/admin/users">
                            <User className="h-5 w-5" />
                            <span className="hidden lg:inline font-medium">{t('navbar.users')}</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}

                  <Link
                    to="/profile"
                    className={buttonVariants({ variant: "ghost", className: "hidden sm:flex items-center gap-3 text-sm text-muted-foreground border-l pl-4 ml-4 hover:text-primary" })}
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{displayName}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                    title={t('navbar.logout')}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      <div className="fixed bottom-6 left-6 z-50">
        <LanguageSwitcher />
      </div>

      <ProductDetailsDialog
        open={useProductModal((state) => state.isOpen)}
        onOpenChange={(open) => !open && useProductModal.getState().closeModal()}
        productId={useProductModal((state) => state.selectedProductId)}
      />
    </div>
  )
}
