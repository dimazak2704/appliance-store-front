import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    CategoryDto,
    CategoryRequestDto
} from '@/api/dictionaries';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
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

const formSchema = z.object({
    nameEn: z.string().min(1, 'Name (EN) is required'),
    nameUa: z.string().min(1, 'Name (UA) is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminCategoriesPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nameEn: '',
            nameUa: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            toast.success(isUa ? 'Категорію створено' : 'Category created');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCloseDialog();
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.createError' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CategoryRequestDto }) => updateCategory(id, data),
        onSuccess: () => {
            toast.success(isUa ? 'Категорію оновлено' : 'Category updated');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCloseDialog();
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.updateError' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            toast.success(isUa ? 'Категорію видалено' : 'Category deleted');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setDeletingCategoryId(null);
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.deleteError' });
            setDeletingCategoryId(null);
        },
    });

    const handleAddNew = () => {
        setEditingCategory(null);
        form.reset({ nameEn: '', nameUa: '' });
        setIsDialogOpen(true);
    };

    const handleEdit = (category: CategoryDto) => {
        setEditingCategory(category);
        form.reset({ nameEn: category.nameEn, nameUa: category.nameUa });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        form.reset();
        setEditingCategory(null);
    };

    const onSubmit = (values: FormValues) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const handleDelete = () => {
        if (deletingCategoryId) {
            deleteMutation.mutate(deletingCategoryId);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="container mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex justify-between items-center">
                        {isUa ? 'Категорії' : 'Categories'}
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            {isUa ? 'Додати категорію' : 'Add Category'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>{isUa ? 'Назва (UA)' : 'Name (UA)'}</TableHead>
                                    <TableHead>{isUa ? 'Назва (EN)' : 'Name (EN)'}</TableHead>
                                    <TableHead className="text-right">{isUa ? 'Дії' : 'Actions'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {isUa ? 'Завантаження...' : 'Loading...'}
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-red-500">
                                            {isUa ? 'Помилка завантаження' : 'Error loading data'}
                                        </TableCell>
                                    </TableRow>
                                ) : categories?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {isUa ? 'Категорій немає' : 'No categories found'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories?.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell>#{category.id}</TableCell>
                                            <TableCell>{category.nameUa}</TableCell>
                                            <TableCell>{category.nameEn}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => setDeletingCategoryId(category.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? (isUa ? 'Редагувати категорію' : 'Edit Category') : (isUa ? 'Створити категорію' : 'Create Category')}</DialogTitle>
                        <DialogDescription>
                            {isUa ? 'Введіть назви категорії обома мовами.' : 'Enter category names in both languages.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nameUa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name (UA)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nameEn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name (EN)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>{isUa ? 'Скасувати' : 'Cancel'}</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUa ? 'Зберегти' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deletingCategoryId} onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isUa ? 'Ви впевнені?' : 'Are you sure?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isUa ? 'Ця дія незворотна.' : 'This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{isUa ? 'Скасувати' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUa ? 'Видалити' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
