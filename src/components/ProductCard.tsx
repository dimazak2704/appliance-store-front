import { ApplianceDto } from '../api/appliances';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import { addToCart } from '@/api/cart';
import { useCartDrawerStore } from '@/store/useCartDrawerStore';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
    product: ApplianceDto;
    onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const { open: openCart } = useCartDrawerStore();
    const queryClient = useQueryClient();

    const addToCartMutation = useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            openCart();
        },
    });

    const name = isUa ? product.nameUa : product.nameEn;
    const category = isUa ? product.categoryNameUa : product.categoryNameEn;
    const price = product.price;
    const currency = isUa ? 'грн' : 'UAH';

    // Prepends base URL if relative path
    const API_BASE_URL = 'http://localhost:8080';
    const imageUrl = product.imageUrl.startsWith('http')
        ? product.imageUrl
        : `${API_BASE_URL}${product.imageUrl}`;

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            navigate(`/register?returnUrl=${returnUrl}&action=add&productId=${product.id}`);
            return;
        }
        addToCartMutation.mutate(product.id);
    };

    return (
        <Card
            className={`h-full flex flex-col hover:shadow-lg transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                    {/* Use a placeholder if image fails or for better UX */}
                    <img
                        src={imageUrl}
                        alt={name}
                        className="object-contain w-full h-full p-4 transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=No+Image'; // Fallback
                        }}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
                <div className="text-sm text-muted-foreground mb-1">{category}</div>
                <h3 className="font-semibold text-lg line-clamp-2 mb-2" title={name}>{name}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm px-2 py-1 bg-secondary rounded-md text-secondary-foreground text-xs">
                        {product.manufacturerName}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                <div className="text-xl font-bold w-full">
                    {price.toLocaleString()} <span className="text-sm font-normal">{currency}</span>
                </div>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                    }}
                    className="w-full"
                >
                    {isUa ? 'Купити' : 'Add to Cart'}
                </Button>
            </CardFooter>
        </Card>
    );
}
