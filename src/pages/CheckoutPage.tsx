import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod'; // Assuming zod is available or use standard validation
import { zodResolver } from '@hookform/resolvers/zod';
import { getCart, checkout } from '@/api/cart';
import { Button } from '@/components/ui/button';
// ... imports
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

// Define schema
const checkoutSchema = z.object({
    phone: z.string().min(10, 'Phone number is required'),
    address: z.string().min(5, 'Address is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: cart, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
    });

    const checkoutMutation = useMutation({
        mutationFn: checkout,
        onSuccess: (orderId) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            navigate(`/order-success/${orderId}`);
        },
        onError: (error) => {
            console.error('Checkout failed:', error);
            // Show toast error
        },
    });

    const onSubmit = (data: CheckoutFormValues) => {
        checkoutMutation.mutate(data);
    };

    if (isLoading) {
        return <div className="flex justify-center p-10">Loading...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto p-10 text-center">
                <h2>{isUa ? 'Кошик порожній' : 'Your cart is empty'}</h2>
                <Button className="mt-4" onClick={() => navigate('/')}>
                    {isUa ? 'До каталогу' : 'Go to Catalog'}
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">{isUa ? 'Оформлення замовлення' : 'Checkout'}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{isUa ? 'Ваше замовлення' : 'Your Order'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium">{isUa ? item.nameUa : item.nameEn}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p>{(item.price * item.quantity).toLocaleString()} {isUa ? 'грн' : 'UAH'}</p>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="flex justify-between font-bold text-lg border-t pt-4">
                            <span>{isUa ? 'Всього' : 'Total'}</span>
                            <span>{cart.totalPrice.toLocaleString()} {isUa ? 'грн' : 'UAH'}</span>
                        </CardFooter>
                    </Card>
                </div>

                {/* Checkout Form */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{isUa ? 'Деталі доставки' : 'Delivery Details'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">{isUa ? 'Телефон' : 'Phone'}</Label>
                                    <Input id="phone" {...register('phone')} placeholder="+380..." />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">{isUa ? 'Адреса доставки' : 'Delivery Address'}</Label>
                                    {/* Using Input as Textarea replacement since Textarea component might not exist yet */}
                                    <Input id="address" {...register('address')} className="h-24" />
                                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                </div>

                                <Button type="submit" className="w-full mt-4" disabled={checkoutMutation.isPending}>
                                    {checkoutMutation.isPending ? (isUa ? 'Обробка...' : 'Processing...') : (isUa ? 'Підтвердити замовлення' : 'Place Order')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
