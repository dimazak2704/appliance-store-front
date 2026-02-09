import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { getMyOrders, OrderHistoryDto } from '@/api/profile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
        { value: 'NEW', label: isUa ? 'Нові' : 'New' },
        { value: 'CONFIRMED', label: isUa ? 'Підтверджено' : 'Confirmed' },
        { value: 'SHIPPED', label: isUa ? 'Відправлено' : 'Shipped' },
        { value: 'CANCELED', label: isUa ? 'Скасовано' : 'Canceled' },
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

    // Safety check for total amount using the new field name
    const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md border-muted-foreground/20">
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
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
                    <Badge className={getStatusColor(order.status)}>
                        {order.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <CardContent className="border-t bg-muted/30 p-4 md:p-6 animate-in slide-in-from-top-1 duration-200">
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

                    <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">{isUa ? 'Товари' : 'Items'}</h4>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center bg-background p-3 rounded-lg border border-border/50">
                                    <div className="h-16 w-16 bg-white rounded-md border flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productNameEn} className="h-full w-full object-contain" />
                                        ) : (
                                            <Package className="h-6 w-6 text-gray-300" />
                                        )}
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
                </CardContent>
            )}
        </Card>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'NEW': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        case 'CONFIRMED': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case 'SHIPPED': return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'CANCELED': return 'bg-red-100 text-red-800 hover:bg-red-100';
        default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
}
