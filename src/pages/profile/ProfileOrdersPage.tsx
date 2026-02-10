import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProductModal } from '@/store/productStore';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Package, CheckCircle, Truck, XCircle } from 'lucide-react';
import { getMyOrders, cancelOrder, OrderHistoryDto, OrderStatus } from '@/api/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export function ProfileOrdersPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders', statusFilter],
        queryFn: () => getMyOrders(statusFilter),
    });

    const statusTabs = [
        { value: 'ALL', label: isUa ? 'Всі' : 'All' },
        { value: OrderStatus.NEW, label: isUa ? 'Нові' : 'New' },
        { value: OrderStatus.CONFIRMED, label: isUa ? 'Підтверджено' : 'Confirmed' },
        { value: OrderStatus.SHIPPED, label: isUa ? 'Відправлено' : 'Shipped' },
        { value: OrderStatus.CANCELED, label: isUa ? 'Скасовано' : 'Canceled' },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">{isUa ? 'Мої замовлення' : 'My Orders'}</h2>

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="space-y-4">
                {orders && orders.length > 0 ? (
                    orders.map((order) => (
                        <OrderCard key={order.id} order={order} isUa={isUa} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                        <h3 className="text-lg font-medium">{isUa ? 'Замовлень не знайдено' : 'No orders found'}</h3>
                        <p className="text-muted-foreground">{isUa ? 'У цій категорії немає замовлень' : 'You have no orders in this category'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderCard({ order, isUa }: { order: OrderHistoryDto, isUa: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const queryClient = useQueryClient();

    // Safety check for total amount using the new field name
    const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;

    const cancelMutation = useMutation({
        mutationFn: cancelOrder,
        onSuccess: () => {
            toast.success(isUa ? 'Замовлення успішно скасовано' : 'Order canceled successfully');
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        },
        onError: () => {
            toast.error(isUa ? 'Не вдалося скасувати замовлення' : 'Failed to cancel order');
        },
    });

    const handleCancel = () => {
        cancelMutation.mutate(order.id);
    };

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md border-muted-foreground/20">
            <div className="p-4 md:p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{isUa ? 'Замовлення №' : 'Order #'}{order.id}</span>
                                <span>•</span>
                                <span>{order.date ? format(new Date(order.date), 'dd.MM.yyyy HH:mm') : 'N/A'}</span>
                            </div>
                            <div className="font-semibold text-lg">
                                {totalAmount.toLocaleString()} {isUa ? 'грн' : 'UAH'}
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4">
                            {/* Replaced Badge with Stepper Preview or Status Text if collapsed */}
                            <div className="md:hidden">
                                <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Stepper always visible on desktop, or when expanded on mobile */}
                    <div className="hidden md:block w-full mt-2">
                        <OrderStepper status={order.status} isUa={isUa} />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <CardContent className="border-t bg-muted/30 p-4 md:p-6 animate-in slide-in-from-top-1 duration-200">
                    <div className="md:hidden mb-6">
                        <OrderStepper status={order.status} isUa={isUa} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">{isUa ? 'Доставка' : 'Delivery'}</h4>
                            <p className="font-medium text-foreground">{order.deliveryType}</p>
                            {order.deliveryAddress && <p className="text-sm text-muted-foreground mt-1">{order.deliveryAddress}</p>}
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">{isUa ? 'Вартість доставки' : 'Delivery Cost'}</h4>
                            <p className="font-medium">{order.deliveryCost > 0 ? `${order.deliveryCost} ${isUa ? 'грн' : 'UAH'}` : (isUa ? 'Безкоштовно' : 'Free')}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">{isUa ? 'Товари' : 'Items'}</h4>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.productId} className="flex gap-4 items-center bg-background p-3 rounded-lg border border-border/50">
                                    <div className="h-16 w-16 bg-white rounded-md border flex-shrink-0 flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-primary"
                                        onClick={() => useProductModal.getState().openModal(item.productId)}
                                    >
                                        <ProductImage
                                            imageUrl={item.imageUrl}
                                            alt={item.productNameEn}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm line-clamp-2 leading-tight mb-1">{isUa ? item.productNameUa : item.productNameEn}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} x {typeof item.priceAtPurchase === 'number' ? item.priceAtPurchase.toLocaleString() : 0} {isUa ? 'грн' : 'UAH'}
                                        </p>
                                    </div>
                                    <div className="font-semibold text-sm whitespace-nowrap">
                                        {(item.quantity * (typeof item.priceAtPurchase === 'number' ? item.priceAtPurchase : 0)).toLocaleString()} {isUa ? 'грн' : 'UAH'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {order.status === OrderStatus.NEW && (
                        <div className="flex justify-end pt-4 border-t border-border/50">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                                        {isUa ? 'Скасувати замовлення' : 'Cancel Order'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{isUa ? 'Скасувати замовлення?' : 'Cancel Order?'}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {isUa
                                                ? 'Ви впевнені, що хочете скасувати це замовлення? Цю дію неможливо скасувати.'
                                                : 'Are you sure you want to cancel this order? This action cannot be undone.'}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{isUa ? 'Назад' : 'Back'}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {isUa ? 'Так, Скасувати' : 'Yes, Cancel'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

function PaddedIcon({ active, completed, icon: Icon }: { active: boolean; completed: boolean; icon: any }) {
    if (completed) {
        return <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></div>;
    }
    if (active) {
        return <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-primary"><Icon className="h-5 w-5" /></div>;
    }
    return <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background text-muted-foreground"><Icon className="h-5 w-5" /></div>;
}

function OrderStepper({ status, isUa }: { status: OrderStatus; isUa: boolean }) {
    if (status === OrderStatus.CANCELED) {
        return (
            <div className="w-full bg-red-50 border border-red-200 rounded-md p-3 flex items-center justify-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{isUa ? 'Замовлення скасовано' : 'Order Canceled'}</span>
            </div>
        );
    }

    const steps = [
        { id: OrderStatus.NEW, label: isUa ? 'Створено' : 'Placed', icon: Package },
        { id: OrderStatus.CONFIRMED, label: isUa ? 'Підтверджено' : 'Confirmed', icon: CheckCircle },
        { id: OrderStatus.SHIPPED, label: isUa ? 'Відправлено' : 'Shipped', icon: Truck },
        { id: OrderStatus.COMPLETED, label: isUa ? 'Виконано' : 'Completed', icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === status);
    // If status is not in the list (e.g. unknown), default to -1. 
    // For COMPLETED, we want all previous steps highlighted.

    // Mapping for progress bar logic:
    // NEW: index 0. Active: 0. Completed: -1
    // CONFIRMED: index 1. Active: 1. Completed: 0
    // SHIPPED: index 2. Active: 2. Completed: 0, 1
    // COMPLETED: index 3. Active: 3. Completed: 0, 1, 2

    return (
        <div className="relative flex w-full justify-between">
            {/* Connecting Lines */}
            <div className="absolute top-4 left-0 h-0.5 w-full -translate-y-1/2 bg-muted px-2">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}></div>
            </div>

            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex || status === OrderStatus.COMPLETED;
                const isActive = index === currentStepIndex && status !== OrderStatus.COMPLETED;

                // For COMPLETED status, the last step is also "completed" visual style
                const visualCompleted = isCompleted || (status === OrderStatus.COMPLETED && index === currentStepIndex);

                return (
                    <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                        <PaddedIcon active={isActive} completed={visualCompleted} icon={step.icon} />
                        <span className={`text-xs font-medium ${isActive || visualCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function ProductImage({ imageUrl, alt }: { imageUrl?: string; alt: string }) {
    // If imageUrl is relative, prepend base URL. 
    // Assuming backend is at localhost:8080 for dev, but commonly we use an env var.
    // We'll trust the user request to just "ensure correct base URL". 
    // Ideally we should use import.meta.env.VITE_API_URL or similar.

    const [imgSrc] = useState<string | undefined>(imageUrl);
    const [error, setError] = useState(false);

    const getFullUrl = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        // Simple heuristic: if it starts with /, it's relative to root (public) or API
        // If it looks like an API served image, prepend API URL.
        return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const finalSrc = error ? undefined : getFullUrl(imgSrc);

    if (!finalSrc || error) {
        return <Package className="h-6 w-6 text-gray-300" />;
    }

    return (
        <img
            src={finalSrc}
            alt={alt}
            className="h-full w-full object-contain"
            onError={() => setError(true)}
        />
    );
}


function getStatusColor(status: OrderStatus) {
    switch (status) {
        case OrderStatus.NEW: return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        case OrderStatus.CONFIRMED: return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case OrderStatus.SHIPPED: return 'bg-green-100 text-green-800 hover:bg-green-100';
        case OrderStatus.CANCELED: return 'bg-red-100 text-red-800 hover:bg-red-100';
        case OrderStatus.COMPLETED: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
}
