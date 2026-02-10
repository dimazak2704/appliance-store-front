import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { getAppliances, ApplianceDto } from '@/api/appliances';
import { deleteProduct } from '@/api/admin/products';
import { ProductFormSheet } from '@/components/admin/ProductFormSheet';
import { handleApiError } from '@/lib/errorHandler';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export function AdminProductsPage() {
    const { t, i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ApplianceDto | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

    // Search & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }[]>([]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(0); // Reset page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-products', page, debouncedSearch, sortConfig],
        queryFn: () => getAppliances({
            page,
            size: pageSize,
            sort: sortConfig.length > 0
                ? sortConfig.map(s => `${s.key},${s.direction}`)
                : 'id,desc',
            name: debouncedSearch || undefined
        }),
    });

    const handleSort = (key: string) => {
        setSortConfig(current => {
            const existingIndex = current.findIndex(s => s.key === key);

            if (existingIndex === -1) {
                // Not sorted -> Add as Asc (at the end)
                return [...current, { key, direction: 'asc' }];
            }

            const existing = current[existingIndex];
            if (existing.direction === 'asc') {
                // Asc -> Desc (stay in place)
                const updated = [...current];
                updated[existingIndex] = { key, direction: 'desc' };
                return updated;
            } else {
                // Desc -> Remove (No Sort)
                return current.filter(s => s.key !== key);
            }
        });
    };

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            toast.success(t('admin.successDelete'));
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            setDeletingProductId(null);
        },
        onError: (error) => {
            handleApiError(error, {
                setGlobalError: (message: string) => toast.error(message),
            });
            setDeletingProductId(null);
        },
    });

    const handleEdit = (product: ApplianceDto) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (deletingProductId) {
            deleteMutation.mutate(deletingProductId);
        }
    };

    const renderSortIcon = (key: string) => {
        const sortState = sortConfig.find(s => s.key === key);
        const index = sortConfig.findIndex(s => s.key === key);

        if (!sortState) return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;

        return (
            <div className="flex items-center ml-2">
                {sortState.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {sortConfig.length > 1 && <span className="text-[10px] ml-0.5 font-bold">{index + 1}</span>}
            </div>
        );
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex justify-between items-center mb-4">
                        {t('admin.management')}
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin.addProduct')}
                        </Button>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder={t('admin.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] cursor-pointer hover:bg-muted/50" onClick={() => handleSort('id')}>
                                        <div className="flex items-center">
                                            {t('admin.table.id')} {renderSortIcon('id')}
                                        </div>
                                    </TableHead>
                                    <TableHead>{t('admin.table.image')}</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(isUa ? 'nameUa' : 'nameEn')}>
                                        <div className="flex items-center">
                                            {t('admin.table.name')} {renderSortIcon(isUa ? 'nameUa' : 'nameEn')}
                                        </div>
                                    </TableHead>
                                    <TableHead>{t('admin.table.category')}</TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('price')}>
                                        <div className="flex items-center">
                                            {t('admin.table.price')} {renderSortIcon('price')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('stockQuantity')}>
                                        <div className="flex items-center">
                                            {t('admin.table.stock')} {renderSortIcon('stockQuantity')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            {t('buttons.loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-red-500">
                                            {t('errors.somethingWentWrong')}
                                        </TableCell>
                                    </TableRow>
                                ) : data?.content.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            {t('admin.table.noProducts')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.content.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>#{product.id}</TableCell>
                                            <TableCell>
                                                {product.imageUrl && (
                                                    <img src={`http://localhost:8080${product.imageUrl}`} alt={product.nameEn} className="h-10 w-10 object-cover rounded" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {isUa ? product.nameUa : product.nameEn}
                                                <div className="text-xs text-muted-foreground">{product.model}</div>
                                            </TableCell>
                                            <TableCell>{isUa ? product.categoryNameUa : product.categoryNameEn}</TableCell>
                                            <TableCell>{product.price.toLocaleString()} {isUa ? 'грн' : 'UAH'}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.stockQuantity > 0 ? 'outline' : 'destructive'}>
                                                    {product.stockQuantity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => setDeletingProductId(product.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
                                {t('buttons.goBack')}
                            </Button>
                            <div className="text-sm font-medium">
                                {isUa
                                    ? `Сторінка ${page + 1} з ${data.totalPages}`
                                    : `Page ${page + 1} of ${data.totalPages}`}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                disabled={page === data.totalPages - 1}
                            >
                                {t('buttons.next') !== 'buttons.next' ? t('buttons.next') : (isUa ? 'Далі' : 'Next')}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ProductFormSheet
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                productToEdit={editingProduct}
            />

            <AlertDialog open={!!deletingProductId} onOpenChange={(open: boolean) => !open && setDeletingProductId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.deleteConfirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('admin.deleteConfirm.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('admin.deleteConfirm.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('admin.deleteConfirm.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
