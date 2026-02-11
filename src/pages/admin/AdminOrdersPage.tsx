import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProductModal } from '@/store/productStore';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { getAdminOrders, updateOrderStatus, AdminOrderDto } from '@/api/admin/orders';
import { handleApiError } from '@/lib/errorHandler';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const ORDER_STATUSES = ['NEW', 'CONFIRMED', 'SHIPPED', 'CANCELED', 'COMPLETED'];

export function AdminOrdersPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [deliveryFilter, setDeliveryFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSort] = useState<string>('createdAt,desc');
    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderDto | null>(null);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-orders', statusFilter, deliveryFilter, debouncedSearch, sort, page],
        queryFn: () => getAdminOrders({
            page,
            size: pageSize,
            status: statusFilter,
            deliveryType: deliveryFilter,
            search: debouncedSearch || undefined,
            sort: [sort]
        }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
        onSuccess: () => {
            toast.success(isUa ? 'Статус оновлено' : 'Status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.statusUpdateError' });
        },
    });

    const handleStatusChange = (orderId: number, newStatus: string) => {
        updateStatusMutation.mutate({ id: orderId, status: newStatus });
    };

    const handleClearFilters = () => {
        setStatusFilter('ALL');
        setDeliveryFilter('ALL');
        setSearchQuery('');
        setDebouncedSearch('');
        setSort('createdAt,desc');
        setPage(0);
    };

    const getImageUrl = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex justify-between items-center">
                        {isUa ? 'Управління замовленнями' : 'Order Management'}
                        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Filters Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder={isUa ? "Пошук за ID, телефоном, клієнтом..." : "Search ID, Phone, Client..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">{isUa ? 'Всі статуси' : 'All Statuses'}</SelectItem>
                                        {ORDER_STATUSES.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={deliveryFilter} onValueChange={(val) => { setDeliveryFilter(val); setPage(0); }}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Delivery" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">{isUa ? 'Всі доставки' : 'All Deliveries'}</SelectItem>
                                        <SelectItem value="COURIER">Courier</SelectItem>
                                        <SelectItem value="POST">Post</SelectItem>
                                        <SelectItem value="SELF_PICKUP">Self Pickup</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sort} onValueChange={(val) => { setSort(val); setPage(0); }}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort By" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt,desc">{isUa ? 'Дата: спочатку нові' : 'Date: Newest First'}</SelectItem>
                                        <SelectItem value="createdAt,asc">{isUa ? 'Дата: спочатку старі' : 'Date: Oldest First'}</SelectItem>
                                        <SelectItem value="totalAmount,desc">{isUa ? 'Ціна: від високої' : 'Price: High to Low'}</SelectItem>
                                        <SelectItem value="totalAmount,asc">{isUa ? 'Ціна: від низької' : 'Price: Low to High'}</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(statusFilter !== 'ALL' || deliveryFilter !== 'ALL' || searchQuery || sort !== 'createdAt,desc') && (
                                    <Button variant="ghost" onClick={handleClearFilters}>
                                        {isUa ? 'Очистити' : 'Clear Filters'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>{isUa ? 'Дата' : 'Date'}</TableHead>
                                        <TableHead>{isUa ? 'Клієнт' : 'Customer'}</TableHead>
                                        <TableHead>{isUa ? 'Сума' : 'Total'}</TableHead>
                                        <TableHead>{isUa ? 'Статус' : 'Status'}</TableHead>
                                        <TableHead className="text-right">{isUa ? 'Дії' : 'Actions'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                {isUa ? 'Завантаження...' : 'Loading...'}
                                            </TableCell>
                                        </TableRow>
                                    ) : isError ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-red-500">
                                                {isUa ? 'Помилка завантаження даних' : 'Error loading data'}
                                            </TableCell>
                                        </TableRow>
                                    ) : data?.content.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                {isUa ? 'Замовлень не знайдено' : 'No orders found'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data?.content.map((order: AdminOrderDto) => (
                                            <TableRow
                                                key={order.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>
                                                    {order.date ? format(new Date(order.date), 'dd.MM.yyyy HH:mm') : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{order.clientName || 'N/A'}</span>
                                                        <span className="text-xs text-muted-foreground">{order.clientPhone || order.clientEmail}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {order.totalAmount?.toLocaleString()} {isUa ? 'грн' : 'UAH'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Select
                                                            defaultValue={order.status}
                                                            onValueChange={(val) => handleStatusChange(order.id, val)}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <SelectTrigger className="w-[130px]">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ORDER_STATUSES.map((status) => (
                                                                    <SelectItem key={status} value={status}>
                                                                        {status}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    {isUa ? 'Назад' : 'Previous'}
                                </Button>
                                <div className="text-sm font-medium">
                                    {isUa ? `Сторінка ${page + 1} з ${data.totalPages}` : `Page ${page + 1} of ${data.totalPages}`}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                    disabled={page === data.totalPages - 1}
                                >
                                    {isUa ? 'Далі' : 'Next'}
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Sheet
                open={!!selectedOrder}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
                className="w-[400px] sm:w-[540px] max-w-[100vw]"
            >
                <SheetContent className="flex flex-col h-full overflow-hidden">
                    <SheetHeader className="border-b pb-4">
                        <SheetTitle className="flex justify-between items-center">
                            <span>{isUa ? 'Замовлення' : 'Order'} #{selectedOrder?.id}</span>
                            <Badge className={selectedOrder ? getStatusColor(selectedOrder.status) : ''}>
                                {selectedOrder?.status}
                            </Badge>
                        </SheetTitle>
                        <SheetDescription>
                            {selectedOrder?.date ? format(new Date(selectedOrder.date), 'dd MMMM yyyy, HH:mm') : ''}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <ScrollArea className="flex-1 -mx-6 px-6">
                                <div className="py-6 space-y-8">
                                    {/* Client Info */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{isUa ? 'Клієнт' : 'Customer'}</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-muted-foreground">{isUa ? 'Ім\'я' : 'Name'}</p>
                                                <p>{selectedOrder.clientName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-muted-foreground">{isUa ? 'Телефон' : 'Phone'}</p>
                                                {selectedOrder.clientPhone ? (
                                                    <a href={`tel:${selectedOrder.clientPhone}`} className="text-primary hover:underline">
                                                        {selectedOrder.clientPhone}
                                                    </a>
                                                ) : (
                                                    <p>{selectedOrder.clientEmail}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{isUa ? 'Доставка' : 'Delivery'}</h3>
                                        <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{isUa ? 'Спосіб' : 'Method'}:</span>
                                                <span className="font-medium">{selectedOrder.deliveryType}</span>
                                            </div>
                                            {selectedOrder.deliveryAddress && (
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-muted-foreground whitespace-nowrap">{isUa ? 'Адреса' : 'Address'}:</span>
                                                    <span className="font-medium text-right">{selectedOrder.deliveryAddress}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{isUa ? 'Товари' : 'Items'} ({selectedOrder.items.length})</h3>
                                        <div className="space-y-4">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="flex gap-4 items-start border-b pb-4 last:border-0">
                                                    <div className="h-16 w-16 bg-white rounded-md border flex-shrink-0 flex items-center justify-center p-1 overflow-hidden cursor-pointer hover:border-primary"
                                                        onClick={() => useProductModal.getState().openModal(item.productId)}
                                                    >
                                                        <img
                                                            src={getImageUrl(item.imageUrl) || 'https://placehold.co/100?text=No+Image'}
                                                            alt={item.productNameEn}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm line-clamp-2 mb-1">{isUa ? item.productNameUa : item.productNameEn}</p>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-muted-foreground">{item.quantity} x {item.priceAtPurchase?.toLocaleString()} {isUa ? 'грн' : 'UAH'}</span>
                                                            <span className="font-semibold">{(item.quantity * item.priceAtPurchase).toLocaleString()} {isUa ? 'грн' : 'UAH'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Footer / Total */}
                            <div className="border-t pt-4 mt-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{isUa ? 'Доставка' : 'Shipping'}</span>
                                        <span>{selectedOrder.deliveryCost > 0 ? `${selectedOrder.deliveryCost.toLocaleString()} ${isUa ? 'грн' : 'UAH'}` : (isUa ? 'Безкоштовно' : 'Free')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>{isUa ? 'Всього' : 'Total Amount'}</span>
                                        <span>{selectedOrder.totalAmount?.toLocaleString()} {isUa ? 'грн' : 'UAH'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'NEW': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        case 'CONFIRMED': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        case 'SHIPPED': return 'bg-green-100 text-green-800 hover:bg-green-100';
        case 'COMPLETED': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        case 'CANCELED': return 'bg-red-100 text-red-800 hover:bg-red-100';
        default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
}
