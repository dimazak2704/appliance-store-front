import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    getManufacturers,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    ManufacturerDto,
    ManufacturerRequestDto
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
    name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function AdminManufacturersPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingManufacturer, setEditingManufacturer] = useState<ManufacturerDto | null>(null);
    const [deletingManufacturerId, setDeletingManufacturerId] = useState<number | null>(null);

    const { data: manufacturers, isLoading, isError } = useQuery({
        queryKey: ['manufacturers'],
        queryFn: getManufacturers,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: createManufacturer,
        onSuccess: () => {
            toast.success(isUa ? 'Виробника створено' : 'Manufacturer created');
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            handleCloseDialog();
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.createError' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ManufacturerRequestDto }) => updateManufacturer(id, data),
        onSuccess: () => {
            toast.success(isUa ? 'Виробника оновлено' : 'Manufacturer updated');
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            handleCloseDialog();
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.updateError' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteManufacturer,
        onSuccess: () => {
            toast.success(isUa ? 'Виробника видалено' : 'Manufacturer deleted');
            queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
            setDeletingManufacturerId(null);
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.deleteError' });
            setDeletingManufacturerId(null);
        },
    });

    const handleAddNew = () => {
        setEditingManufacturer(null);
        form.reset({ name: '' });
        setIsDialogOpen(true);
    };

    const handleEdit = (manufacturer: ManufacturerDto) => {
        setEditingManufacturer(manufacturer);
        form.reset({ name: manufacturer.name });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        form.reset();
        setEditingManufacturer(null);
    };

    const onSubmit = (values: FormValues) => {
        if (editingManufacturer) {
            updateMutation.mutate({ id: editingManufacturer.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const handleDelete = () => {
        if (deletingManufacturerId) {
            deleteMutation.mutate(deletingManufacturerId);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="container mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex justify-between items-center">
                        {isUa ? 'Виробники' : 'Manufacturers'}
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            {isUa ? 'Додати виробника' : 'Add Manufacturer'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>{isUa ? 'Назва' : 'Name'}</TableHead>
                                    <TableHead className="text-right">{isUa ? 'Дії' : 'Actions'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            {isUa ? 'Завантаження...' : 'Loading...'}
                                        </TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-red-500">
                                            {isUa ? 'Помилка завантаження' : 'Error loading data'}
                                        </TableCell>
                                    </TableRow>
                                ) : manufacturers?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            {isUa ? 'Виробників немає' : 'No manufacturers found'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    manufacturers?.map((manufacturer) => (
                                        <TableRow key={manufacturer.id}>
                                            <TableCell>#{manufacturer.id}</TableCell>
                                            <TableCell>{manufacturer.name}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(manufacturer)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={() => setDeletingManufacturerId(manufacturer.id)}>
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
                        <DialogTitle>{editingManufacturer ? (isUa ? 'Редагувати виробника' : 'Edit Manufacturer') : (isUa ? 'Створити виробника' : 'Create Manufacturer')}</DialogTitle>
                        <DialogDescription>
                            {isUa ? 'Введіть назву виробника.' : 'Enter manufacturer name.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isUa ? 'Назва' : 'Name'}</FormLabel>
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
            <AlertDialog open={!!deletingManufacturerId} onOpenChange={(open) => !open && setDeletingManufacturerId(null)}>
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
