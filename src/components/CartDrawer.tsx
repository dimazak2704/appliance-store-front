import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, updateQuantity, removeItem } from '@/api/cart';
import { useCartDrawerStore } from '@/store/useCartDrawerStore';
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
            <div className="flex flex-col h-full w-full bg-background shadow-xl max-w-md ml-auto animate-in slide-in-from-right sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{isUa ? 'Кошик' : 'Shopping Cart'}</SheetTitle>
                </SheetHeader>

                <SheetContent className="flex-1 overflow-y-auto p-0">
                    {isLoading && (
                        <div className="flex items-center justify-center p-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {isError && (
                        <div className="text-center text-red-500 p-10">
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
                        <div className="divide-y">
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
                    )}
                </SheetContent>

                {!isLoading && !isError && cart && cart.items.length > 0 && (
                    <SheetFooter className="p-4 border-t bg-background">
                        <div className="space-y-4 w-full">
                            <div className="flex justify-between text-base font-medium">
                                <p>{isUa ? 'Всього' : 'Total'}</p>
                                <p>{cart.totalPrice.toLocaleString()} {isUa ? 'грн' : 'UAH'}</p>
                            </div>
                            <Button className="w-full" onClick={handleCheckout}>
                                {isUa ? 'Оформити замовлення' : 'Checkout'}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </div>
        </Sheet>
    );
}
