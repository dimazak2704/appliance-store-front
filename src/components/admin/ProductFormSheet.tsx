import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
    createProduct,
    updateProduct,
    uploadProductImage,
    ApplianceRequestDto
} from '@/api/admin/products';
import { getCategories, getManufacturers } from '@/api/dictionaries';
import { handleApiError } from '@/lib/errorHandler';
import { ApplianceDto, getApplianceById } from '@/api/appliances';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
    nameEn: z.string().min(1, 'Name (EN) is required'),
    nameUa: z.string().min(1, 'Name (UA) is required'),
    descriptionEn: z.string().min(1, 'Description (EN) is required'),
    descriptionUa: z.string().min(1, 'Description (UA) is required'),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    stockQuantity: z.coerce.number().int().min(0, 'Stock must be non-negative'),
    categoryId: z.coerce.number().min(1, 'Category is required'),
    manufacturerId: z.coerce.number().min(1, 'Manufacturer is required'),
    model: z.string().min(1, 'Model is required'),
    power: z.coerce.number().min(0, 'Power must be non-negative'),
    powerType: z.enum(['AC220', 'AC110', 'ACCUMULATOR']),
    image: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productToEdit?: ApplianceDto | null;
}

export function ProductFormSheet({ open, onOpenChange, productToEdit }: ProductFormSheetProps) {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers });

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nameEn: '',
            nameUa: '',
            descriptionEn: '',
            descriptionUa: '',
            price: 0,
            stockQuantity: 0,
            categoryId: 0,
            manufacturerId: 0,
            model: '',
            power: 0,
            powerType: 'AC220',
        },
    });

    // ... (inside component)

    const { data: fullProductDetails } = useQuery({
        queryKey: ['product', productToEdit?.id],
        queryFn: () => getApplianceById(productToEdit!.id),
        enabled: !!productToEdit,
    });

    useEffect(() => {
        if (open && fullProductDetails) {
            form.reset({
                nameEn: fullProductDetails.nameEn,
                nameUa: fullProductDetails.nameUa,
                descriptionEn: fullProductDetails.descriptionEn,
                descriptionUa: fullProductDetails.descriptionUa,
                price: fullProductDetails.price,
                stockQuantity: fullProductDetails.stockQuantity,
                categoryId: fullProductDetails.categoryId,
                manufacturerId: fullProductDetails.manufacturerId,
                model: fullProductDetails.model,
                power: fullProductDetails.power,
                powerType: fullProductDetails.powerType as "AC220" | "AC110" | "ACCUMULATOR",
            });
            // Set image field separately if needed, but file input is usually uncontrolled or managed differently
            // For image preview we use productToEdit.imageUrl or fullProductDetails.imageUrl
        } else if (open && !productToEdit) {
            form.reset({
                nameEn: '',
                nameUa: '',
                descriptionEn: '',
                descriptionUa: '',
                price: 0,
                stockQuantity: 0,
                categoryId: 0,
                manufacturerId: 0,
                model: '',
                power: 0,
                powerType: 'AC220',
            });
        }
    }, [open, productToEdit, fullProductDetails, form]);

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: number; file: File }) => uploadProductImage(id, file),
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.uploadImageError' });
        },
    });

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: async (newProduct, variables) => {
            toast.success(isUa ? 'Товар створено' : 'Product created');

            if ((variables as any).image) {
                try {
                    await uploadImageMutation.mutateAsync({ id: newProduct.id, file: (variables as any).image });
                    toast.success(isUa ? 'Зображення завантажено' : 'Image uploaded');
                } catch (error) {
                    console.error(error);
                }
            }

            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            onOpenChange(false);
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.createProductError' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ApplianceRequestDto }) => updateProduct(id, data),
        onSuccess: async (updatedProduct, variables) => {
            toast.success(isUa ? 'Товар оновлено' : 'Product updated');

            if ((variables as any).image) {
                try {
                    await uploadImageMutation.mutateAsync({ id: updatedProduct.id, file: (variables as any).image });
                    toast.success(isUa ? 'Зображення оновлено' : 'Image updated');
                } catch (error) {
                    console.error(error);
                }
            }

            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            onOpenChange(false);
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.updateProductError' });
        },
    });

    const onSubmit = (values: FormValues) => {
        const dto: ApplianceRequestDto = {
            nameEn: values.nameEn,
            nameUa: values.nameUa,
            descriptionEn: values.descriptionEn,
            descriptionUa: values.descriptionUa,
            price: values.price,
            stockQuantity: values.stockQuantity,
            categoryId: values.categoryId,
            manufacturerId: values.manufacturerId,
            model: values.model,
            power: values.power,
            powerType: values.powerType,
        };

        const image = values.image;

        if (productToEdit) {
            // Pass image in the variables object, but cast to any to avoid type error on mutationFn arguments
            updateMutation.mutate({ id: productToEdit.id, data: dto, image } as any);
        } else {
            createMutation.mutate({ ...dto, image } as any);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange} className="sm:max-w-xl">
            <SheetContent className="overflow-y-auto max-h-screen">
                <SheetHeader>
                    <SheetTitle>{productToEdit ? (isUa ? 'Редагувати товар' : 'Edit Product') : (isUa ? 'Додати новий товар' : 'Add New Product')}</SheetTitle>
                    <SheetDescription>
                        {isUa ? 'Заповніть форму нижче. Натисніть зберегти, коли закінчите.' : 'Fill in the form below. Click save when you\'re done.'}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                        <FormItem>
                            <FormLabel>{isUa ? 'Зображення' : 'Image'}</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            form.setValue('image', file);
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                            {productToEdit?.imageUrl && !form.watch('image') && (
                                <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-1">{isUa ? 'Поточне зображення:' : 'Current image:'}</p>
                                    <img src={`http://localhost:8080${productToEdit.imageUrl}`} alt="Current" className="h-20 w-20 object-cover rounded border" />
                                </div>
                            )}
                        </FormItem>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nameEn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name (EN)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nameUa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name (UA)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Категорія' : 'Category'}</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isUa ? "Оберіть категорію" : "Select category"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories?.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {isUa ? cat.nameUa : cat.nameEn}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="manufacturerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Виробник' : 'Manufacturer'}</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isUa ? "Оберіть виробника" : "Select manufacturer"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {manufacturers?.map((m) => (
                                                    <SelectItem key={m.id} value={m.id.toString()}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Модель' : 'Model'}</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Ціна' : 'Price'}</FormLabel>
                                        <FormControl><Input type="number" min="0" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Кількість' : 'Stock'}</FormLabel>
                                        <FormControl><Input type="number" min="0" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="powerType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Тип живлення' : 'Power Type'}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="AC220">AC 220V</SelectItem>
                                                <SelectItem value="AC110">AC 110V</SelectItem>
                                                <SelectItem value="ACCUMULATOR">Aceumulator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="power"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isUa ? 'Потужність (Вт)' : 'Power (W)'}</FormLabel>
                                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descriptionEn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (EN)</FormLabel>
                                    <FormControl><Textarea className="h-20" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="descriptionUa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (UA)</FormLabel>
                                    <FormControl><Textarea className="h-20" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                {isUa ? 'Скасувати' : 'Cancel'}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isUa ? 'Зберегти' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
