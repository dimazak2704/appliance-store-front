import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrderSuccessPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isUa = i18n.language === 'ua';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">
                {isUa ? 'Дякуємо за замовлення!' : 'Thank you for your order!'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
                {isUa ? `Номер вашого замовлення: #${orderId}` : `Your order number is #${orderId}`}
            </p>
            <Button onClick={() => navigate('/')} size="lg">
                {isUa ? 'Продовжити покупки' : 'Continue Shopping'}
            </Button>
        </div>
    );
}
