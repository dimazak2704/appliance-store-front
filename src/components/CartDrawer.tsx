import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getCart, updateQuantity, removeItem } from '@/api/cart';
import { useCartDrawerStore } from '@/store/useCartDrawerStore';
import { toast } from 'sonner';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';

export function CartDrawer() {
    const { isOpen, close } = useCartDrawerStore();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const { data: cart, isLoading, isError } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        enabled: isOpen,
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: number; quantity: number }) => updateQuantity(id, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error: any) => {
            let message = 'Failed to update cart';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                }
            } else if (error.message) {
                message = error.message;
            }
            toast.error(message);
        }
    });

    const removeItemMutation = useMutation({
        mutationFn: removeItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const handleQuantityChange = (applianceId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItemMutation.mutate(applianceId);
        } else {
            updateQuantityMutation.mutate({ id: applianceId, quantity: newQuantity });
        }
    };


    const handleCheckout = () => {
        close();
        navigate('/checkout');
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
            <SheetHeader className="p-4 border-b">
                <SheetTitle>{isUa ? 'Кошик' : 'Shopping Cart'}</SheetTitle>
            </SheetHeader>

            <SheetContent className="p-0">
                {isLoading && (
                    <div className="flex items-center justify-center p-10 h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {isError && (
                    <div className="flex items-center justify-center p-10 h-full text-red-500">
                        {isUa ? 'Помилка завантаження кошика' : 'Error loading cart'}
                    </div>
                )}

                {!isLoading && !isError && (!cart || cart.items.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-muted-foreground gap-4">
                        <ShoppingCart className="h-12 w-12 opacity-20" />
                        <p>{isUa ? 'Ваш кошик порожній' : 'Your cart is empty'}</p>
                        <Button variant="outline" onClick={close}>
                            {isUa ? 'Продовжити покупки' : 'Continue Shopping'}
                        </Button>
                    </div>
                )}

                {!isLoading && !isError && cart && cart.items.length > 0 && (
                    <div className="flex flex-col min-h-full">
                        {/* Free Shipping Banner */}
                        <div className="p-4 bg-muted/30 border-b space-y-3">
                            {cart.isFreeShipping ? (
                                <div className="flex items-center gap-2 text-green-600 font-medium p-2 bg-green-50 rounded-md border border-green-100">
                                    <div className="bg-green-100 p-1.5 rounded-full">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                    <span>
                                        {isUa ? 'Вітаємо! У вас безкоштовна доставка 🎉' : 'Congratulations! You have Free Shipping 🎉'}
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {isUa
                                                ? `Додайте ще ${cart.amountLeftForFreeShipping.toLocaleString()} грн для безкоштовної доставки`
                                                : `Add ${cart.amountLeftForFreeShipping.toLocaleString()} UAH more for free shipping`}
                                        </span>
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Progress
                                        value={(cart.totalPrice / (cart.totalPrice + cart.amountLeftForFreeShipping)) * 100}
                                        className="h-2"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="divide-y pb-4">
                            {cart.items.map((item) => {
                                const API_BASE_URL = 'http://localhost:8080';
                                const imageUrl = item.imageUrl?.startsWith('http')
                                    ? item.imageUrl
                                    : `${API_BASE_URL}${item.imageUrl}`;

                                return (
                                    <div key={item.id} className="flex gap-4 p-4 border-b last:border-0">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-50">
                                            <img
                                                src={imageUrl}
                                                alt={isUa ? item.nameUa : item.nameEn}
                                                className="h-full w-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between text-base font-medium">
                                                    <h3 className="line-clamp-2 text-sm pr-2">{isUa ? item.nameUa : item.nameEn}</h3>
                                                    <p className="whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} <span className="text-xs">{isUa ? 'грн' : 'UAH'}</span></p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2 border rounded-md p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        disabled={updateQuantityMutation.isPending || item.quantity <= 0}
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        disabled={updateQuantityMutation.isPending}
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    disabled={removeItemMutation.isPending}
                                                    onClick={() => removeItemMutation.mutate(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </SheetContent>

            {!isLoading && !isError && cart && cart.items.length > 0 && (
                <SheetFooter className="p-4 border-t bg-background mt-auto">
                    <div className="space-y-4 w-full">
                        <div className="flex justify-between text-base font-medium">
                            <p>{isUa ? 'Всього' : 'Total'}</p>
                            <p>{cart.totalPrice.toLocaleString()} {isUa ? 'грн' : 'UAH'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            {isUa ? 'Доставка розраховується при оформленні' : 'Shipping calculated at checkout'}
                        </p>
                        <Button className="w-full" onClick={handleCheckout}>
                            {isUa ? 'Оформити замовлення' : 'Checkout'}
                        </Button>
                    </div>
                </SheetFooter>
            )}
        </Sheet>
    );
}
