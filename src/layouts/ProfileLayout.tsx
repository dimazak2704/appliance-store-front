import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Package, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';

export function ProfileLayout() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua'; // Simple check for now, can be improved
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const clearAuth = useAuthStore((state) => state.clearAuth);

    const handleLogout = () => {
        clearAuth();
        queryClient.clear();
        navigate('/');
    };

    const navItems = [
        {
            to: '/profile/info',
            icon: User,
            label: isUa ? 'Особисті дані' : 'Personal Info',
        },
        {
            to: '/profile/orders',
            icon: Package,
            label: isUa ? 'Мої замовлення' : 'My Orders',
        },
        {
            to: '/profile/security',
            icon: Shield,
            label: isUa ? 'Безпека' : 'Security',
        },
    ];

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">{isUa ? 'Особистий кабінет' : 'My Account'}</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-muted text-muted-foreground'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3 px-4 py-3 h-auto"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        {isUa ? 'Вийти' : 'Logout'}
                    </Button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-background min-h-[500px]">
                    <div className="bg-card rounded-xl border shadow-sm p-1"> {/* Improved styling */}
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
