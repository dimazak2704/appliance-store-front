import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getApplianceById } from '@/api/appliances';
import { useAuthStore } from '@/features/auth/store';
import { addToCart } from '@/api/cart';
import { useCartDrawerStore } from '@/store/useCartDrawerStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface ProductDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: number | null;
}

export function ProductDetailsDialog({ open, onOpenChange, productId }: ProductDetailsDialogProps) {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isUa = i18n.language === 'ua';
    const { isAuthenticated } = useAuthStore();
    const { open: openCart } = useCartDrawerStore();
    const queryClient = useQueryClient();

    // ...

    const addToCartMutation = useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            onOpenChange(false); // Close dialog
            openCart(); // Open cart drawer
        },
        onError: (error: any) => {
            let message = 'Failed to add to cart';
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

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            navigate(`/register?returnUrl=${returnUrl}&action=add&productId=${productId}`);
            return;
        }
        if (productId) {
            addToCartMutation.mutate(productId);
        }
    };

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['appliance', productId],
        queryFn: () => getApplianceById(productId!),
        enabled: !!productId && open,
    });

    if (!productId && !open) return null;

    const API_BASE_URL = 'http://localhost:8080';
    const imageUrl = product?.imageUrl.startsWith('http')
        ? product.imageUrl
        : `${API_BASE_URL}${product?.imageUrl}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto">
                {isLoading && (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {isError && (
                    <div className="text-center text-red-500 p-10">
                        {isUa ? 'Помилка завантаження товару' : 'Error loading product'}
                    </div>
                )}

                {product && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Image */}
                        <div className="relative flex items-center justify-center bg-white rounded-lg p-6 h-[400px] md:h-[500px] w-full">
                            <img
                                src={imageUrl}
                                alt={isUa ? product.nameUa : product.nameEn}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600?text=No+Image';
                                }}
                            />
                            {/* Stock Badge */}
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                {product.stockQuantity > 0
                                    ? (isUa ? 'В наявності' : 'In Stock')
                                    : (isUa ? 'Немає в наявності' : 'Out of Stock')
                                }
                            </div>
                        </div>

                        {/* Right Column: Info */}
                        <div className="flex flex-col space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                    {isUa ? product.nameUa : product.nameEn}
                                </DialogTitle>
                                <div className="text-sm text-gray-500">
                                    {isUa ? 'Код товару:' : 'Product Code:'} {product.id}
                                </div>
                            </DialogHeader>

                            <div className="text-3xl font-bold text-primary">
                                {product.price.toLocaleString()} <span className="text-xl font-normal">{isUa ? 'грн' : 'UAH'}</span>
                            </div>

                            <DialogDescription className="text-base text-gray-700 leading-relaxed">
                                {isUa ? product.descriptionUa : product.descriptionEn}
                            </DialogDescription>

                            {/* Specs Table */}
                            <div className="bg-gray-50 rounded-lg p-4 text-sm">
                                <h4 className="font-semibold mb-2">{isUa ? 'Характеристики' : 'Specifications'}</h4>
                                <div className="grid grid-cols-2 gap-y-2">
                                    <div className="text-gray-500">{isUa ? 'Категорія' : 'Category'}</div>
                                    <div>{isUa ? product.categoryNameUa : product.categoryNameEn}</div>

                                    <div className="text-gray-500">{isUa ? 'Виробник' : 'Manufacturer'}</div>
                                    <div>{product.manufacturerName}</div>

                                    <div className="text-gray-500">{isUa ? 'Модель' : 'Model'}</div>
                                    <div>{product.model}</div>

                                    <div className="text-gray-500">{isUa ? 'Потужність' : 'Power'}</div>
                                    <div>{product.power} W</div>

                                    <div className="text-gray-500">{isUa ? 'Тип живлення' : 'Power Type'}</div>
                                    <div>{product.powerType}</div>

                                    <div className="text-gray-500">{isUa ? 'Дата додавання' : 'Added Date'}</div>
                                    <div>{new Date(product.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="flex-grow" />

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    className="flex-1 h-12 text-lg"
                                    disabled={product.stockQuantity === 0}
                                    onClick={handleAddToCart}
                                >
                                    {isUa ? 'Купити' : 'Add to Cart'}
                                </Button>
                                <Button variant="outline" className="h-12" onClick={() => onOpenChange(false)}>
                                    {isUa ? 'Закрити' : 'Close'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
