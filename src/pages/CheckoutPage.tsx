import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProductModal } from '@/store/productStore';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { TriangleAlert } from 'lucide-react';
import { getCart, checkout, DeliveryType } from '@/api/cart';
import { getProfile } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type CheckoutFormValues = {
    phone: string;
    address?: string;
};

export function CheckoutPage() {
    const { t, i18n } = useTranslation();
    const isUa = i18n.language === 'uk'; // Зазвичай код 'uk' або 'ua', перевір у своєму конфізі
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: cart, isLoading: isCartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType>('SELF_PICKUP');

    const checkoutSchema = z.object({
        phone: z.string().min(10, isUa ? 'Телефон обов\'язковий (мінімум 10 цифр)' : 'Phone number is required (min 10 digits)'),
        address: z.string().optional(),
    });

    const { register, handleSubmit, setError, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        // Використовуємо values, щоб форма оновилась, коли дані профілю завантажаться
        values: {
            phone: '', // Телефон краще залишити пустим або додати поле phone в UserProfileDto
            address: ''
        }
    });

    const checkoutMutation = useMutation({
        mutationFn: checkout,
        onSuccess: (orderId) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            navigate(`/order-success/${orderId}`); // Виправлено URL (прибрано пробіли)
        },
        onError: (error: any) => {
            console.error('Checkout failed:', error);
            const errorMessage = error.response?.data?.message || (isUa ? 'Помилка оформлення замовлення' : 'Checkout failed');
            toast.error(errorMessage);
        },
    });

    const onSubmit = (data: CheckoutFormValues) => {
        // Ручна валідація адреси, оскільки вона залежить від зовнішнього стейту (selectedDelivery)
        if (selectedDelivery !== 'SELF_PICKUP' && (!data.address || data.address.length < 5)) {
            setError('address', {
                type: 'manual',
                message: isUa ? 'Адреса обов\'язкова для доставки' : 'Address is required for delivery'
            });
            return; // Зупиняємо відправку
        }

        checkoutMutation.mutate({
            ...data,
            address: data.address || '',
            deliveryType: selectedDelivery
        });
    };

    const hasCard = !!profile?.card;
    const isLoading = isCartLoading || isProfileLoading;
    const isFreeShipping = cart ? (cart.isFreeShipping || (cart.totalPrice || 0) >= 30000) : false;

    if (isLoading) {
        return <div className="flex justify-center p-10">Loading...</div>;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container mx-auto p-10 text-center">
                <h2 className="text-2xl font-semibold mb-4">{t('checkout.cartEmpty')}</h2>
                <Button onClick={() => navigate('/')}>
                    {t('checkout.goToCatalog')}
                </Button>
            </div>
        );
    }

    // Розрахунок підсумкової суми
    const deliveryPrice = selectedDelivery === 'SELF_PICKUP' ? 0 : (isFreeShipping ? 0 : (selectedDelivery === 'COURIER' ? 200 : 100));
    const finalTotal = (cart.totalPrice || 0) + deliveryPrice;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('checkout.yourOrder')}</CardTitle>
                            {!isFreeShipping && (
                                <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200">
                                    {t('checkout.freeShippingMessage')}
                                </div>
                            )}
                            {isFreeShipping && (
                                <div className="mt-2 p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200">
                                    {t('checkout.qualifiedFreeShipping')}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div className="cursor-pointer hover:text-primary transition-colors" onClick={() => useProductModal.getState().openModal(item.applianceId)}>
                                        <p className="font-medium">{isUa ? item.nameUa : item.nameEn}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p>{(item.price * item.quantity).toLocaleString()} {isUa ? 'грн' : 'UAH'}</p>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2">
                                <span>{t('checkout.shippingCost')}</span>
                                <div>
                                    {deliveryPrice === 0 ? (
                                        <span className="text-green-600">{t('checkout.free')}</span>
                                    ) : (
                                        <span>{deliveryPrice} {isUa ? 'грн' : 'UAH'}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between font-bold text-lg border-t pt-4">
                            <span>{t('checkout.total')}</span>
                            <span>
                                {finalTotal.toLocaleString()} {isUa ? 'грн' : 'UAH'}
                            </span>
                        </CardFooter>
                    </Card>
                </div>

                {/* Checkout Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('checkout.deliveryDetails')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('checkout.phone')}</Label>
                                    <Input id="phone" {...register('phone')} placeholder="+380..." />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                </div>

                                {selectedDelivery !== 'SELF_PICKUP' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="address">{t('checkout.deliveryAddress')}</Label>
                                        <Input id="address" {...register('address')} className="h-12" />
                                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                    </div>
                                )}

                                {/* Delivery Method Selection */}
                                <div className="space-y-3 pt-4">
                                    <Label>{t('checkout.deliveryMethod')}</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {/* Self Pickup */}
                                        <div
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedDelivery === 'SELF_PICKUP' ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
                                            onClick={() => setSelectedDelivery('SELF_PICKUP')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={selectedDelivery === 'SELF_PICKUP'}
                                                    onChange={() => setSelectedDelivery('SELF_PICKUP')}
                                                    className="accent-primary h-4 w-4"
                                                />
                                                <span>{t('checkout.selfPickup')}</span>
                                            </div>
                                            <div className="font-medium text-green-600">
                                                {t('checkout.free')}
                                            </div>
                                        </div>

                                        {/* Courier */}
                                        <div
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedDelivery === 'COURIER' ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
                                            onClick={() => setSelectedDelivery('COURIER')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={selectedDelivery === 'COURIER'}
                                                    onChange={() => setSelectedDelivery('COURIER')}
                                                    className="accent-primary h-4 w-4"
                                                />
                                                <span>{t('checkout.courier')}</span>
                                            </div>
                                            <div className="font-medium">
                                                {isFreeShipping ? (
                                                    <span><span className="line-through text-muted-foreground mr-2">200 {isUa ? 'грн' : 'UAH'}</span><span className="text-green-600">0 {isUa ? 'грн' : 'UAH'}</span></span>
                                                ) : (
                                                    <span>200 {isUa ? 'грн' : 'UAH'}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Post */}
                                        <div
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedDelivery === 'POST' ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
                                            onClick={() => setSelectedDelivery('POST')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={selectedDelivery === 'POST'}
                                                    onChange={() => setSelectedDelivery('POST')}
                                                    className="accent-primary h-4 w-4"
                                                />
                                                <span>{t('checkout.novaPoshta')}</span>
                                            </div>
                                            <div className="font-medium">
                                                {isFreeShipping ? (
                                                    <span><span className="line-through text-muted-foreground mr-2">100 {isUa ? 'грн' : 'UAH'}</span><span className="text-green-600">0 {isUa ? 'грн' : 'UAH'}</span></span>
                                                ) : (
                                                    <span>100 {isUa ? 'грн' : 'UAH'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!hasCard && (
                                    <Alert variant="destructive" className="mt-4">
                                        <TriangleAlert className="h-4 w-4" />
                                        <AlertTitle>{t('checkout.cardRequired')}</AlertTitle>
                                        <AlertDescription>
                                            {t('checkout.cardRequiredMessage')}
                                            <Link to="/profile" className="font-semibold underline underline-offset-4 hover:text-primary ml-1">
                                                {t('checkout.goToProfile')}
                                            </Link>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full mt-4" disabled={checkoutMutation.isPending || !hasCard}>
                                    {checkoutMutation.isPending ? t('checkout.processing') : t('checkout.placeOrder')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}