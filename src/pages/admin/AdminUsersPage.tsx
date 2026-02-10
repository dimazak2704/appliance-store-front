import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Loader2, Plus, Pencil, Trash2, Ban, CheckCircle, Search, Shield, ShieldAlert, ShieldCheck,
    ChevronLeft, ChevronRight
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import {
    getAllUsers, createUser, updateUser, updateUserRole, toggleUserStatus, deleteUser,
    AdminUserDto, UserCreateRequest, UserUpdateRequest
} from '@/api/admin/users';

// Schemas
// Use z.string() for inputs to match form behavior, handle validation via refine
const createUserFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CLIENT", "EMPLOYEE", "ADMIN"]),
    card: z.string().optional(), // Allow string or undefined, but default is ''
}).refine((data) => {
    // If role is CLIENT and card is provided (non-empty), must be 16 digits
    if (data.role === 'CLIENT' && data.card && data.card.length > 0 && data.card.length !== 16) {
        return false;
    }
    return true;
}, {
    message: "Card number must be exactly 16 digits",
    path: ["card"],
});

const updateUserFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    card: z.string().optional(),
}).refine((data) => {
    if (data.card && data.card.length > 0 && data.card.length !== 16) {
        return false;
    }
    return true;
}, {
    message: "Card number must be exactly 16 digits",
    path: ["card"],
});


export function AdminUsersPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const pageSize = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Filter State
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);
    const [roleChangingUser, setRoleChangingUser] = useState<AdminUserDto | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [roleFilter, statusFilter]);
    // Query
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-users', page, debouncedSearch, roleFilter, statusFilter],
        queryFn: () => getAllUsers(
            page,
            pageSize,
            debouncedSearch,
            undefined, // sort removed for now as per requirement to focus on filtering
            roleFilter !== 'ALL' ? roleFilter : undefined,
            statusFilter !== 'ALL' ? (statusFilter === 'ACTIVE') : undefined
        ),
    });

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter('ALL');
        setStatusFilter('ALL');
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            toast.success(isUa ? 'Користувача створено' : 'User created');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsCreateOpen(false);
        },
        onError: () => toast.error(isUa ? 'Помилка створення' : 'Failed to create user')
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: number; data: UserUpdateRequest }) => updateUser(vars.id, vars.data),
        onSuccess: () => {
            toast.success(isUa ? 'Користувача оновлено' : 'User updated');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setEditingUser(null);
        },
        onError: () => toast.error(isUa ? 'Помилка оновлення' : 'Failed to update user')
    });

    const roleMutation = useMutation({
        mutationFn: (vars: { id: number; role: string }) => updateUserRole(vars.id, vars.role),
        onSuccess: () => {
            toast.success(isUa ? 'Роль змінено' : 'Role updated');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setRoleChangingUser(null);
        },
        onError: () => toast.error(isUa ? 'Помилка зміни ролі' : 'Failed to update role')
    });

    const statusMutation = useMutation({
        mutationFn: (vars: { id: number; enabled: boolean }) => toggleUserStatus(vars.id, vars.enabled),
        onSuccess: (_, vars) => {
            toast.success(isUa ? (vars.enabled ? 'Розблоковано' : 'Заблоковано') : (vars.enabled ? 'User activated' : 'User banned'));
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => toast.error(isUa ? 'Помилка зміни статусу' : 'Failed to update status')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success(isUa ? 'Користувача видалено' : 'User deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setDeletingUserId(null);
        },
        onError: () => toast.error(isUa ? 'Помилка видалення' : 'Failed to delete user')
    });

    // Forms
    // Allow empty string for card, treat as undefined logic in submit
    const createForm = useForm<z.infer<typeof createUserFormSchema>>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'CLIENT',
            card: '',
        }
    });

    // Watch role to conditionally show card field
    const createRole = createForm.watch("role");

    const updateForm = useForm<z.infer<typeof updateUserFormSchema>>({
        resolver: zodResolver(updateUserFormSchema),
        defaultValues: { name: '', email: '', card: '' }
    });

    useEffect(() => {
        if (editingUser) {
            updateForm.reset({
                name: editingUser.name,
                email: editingUser.email,
                card: editingUser.card || ''
            });
        }
    }, [editingUser, updateForm]);

    const onCreateSubmit = (values: z.infer<typeof createUserFormSchema>) => {
        // Prepare DTO
        const submitValues: UserCreateRequest = {
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
            card: (values.role === 'CLIENT' && values.card && values.card.trim() !== '') ? values.card : undefined
        };
        createMutation.mutate(submitValues);
    };

    const onUpdateSubmit = (values: z.infer<typeof updateUserFormSchema>) => {
        if (editingUser) {
            const submitValues: UserUpdateRequest = {
                name: values.name,
                email: values.email,
                card: (values.card && values.card.trim() !== '') ? values.card : undefined
            };
            updateMutation.mutate({ id: editingUser.id, data: submitValues });
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return <Badge variant="destructive" className="items-center gap-1"><ShieldAlert className="w-3 h-3" /> ADMIN</Badge>;
            case 'EMPLOYEE': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 items-center gap-1"><ShieldCheck className="w-3 h-3" /> EMPLOYEE</Badge>;
            default: return <Badge variant="outline" className="items-center gap-1"><Shield className="w-3 h-3" /> CLIENT</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex justify-between items-center mb-4">
                        {isUa ? 'Управління користувачами' : 'User Management'}
                        <Button onClick={() => { createForm.reset(); setIsCreateOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            {isUa ? 'Додати користувача' : 'Add User'}
                        </Button>
                    </CardTitle>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isUa ? 'Пошук за ім\'ям або поштою...' : 'Search by name or email...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={isUa ? "Всі ролі" : "All Roles"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{isUa ? "Всі ролі" : "All Roles"}</SelectItem>
                                <SelectItem value="CLIENT">Client</SelectItem>
                                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={isUa ? "Всі статуси" : "All Statuses"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{isUa ? "Всі статуси" : "All Statuses"}</SelectItem>
                                <SelectItem value="ACTIVE">{isUa ? "Активні" : "Active"}</SelectItem>
                                <SelectItem value="BANNED">{isUa ? "Заблоковані" : "Banned"}</SelectItem>
                            </SelectContent>
                        </Select>
                        {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                            <Button variant="ghost" onClick={resetFilters} className="px-2 lg:px-3">
                                {isUa ? 'Скинути' : 'Reset'}
                                <Trash2 className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">ID</TableHead>
                                    <TableHead>{isUa ? 'Ім\'я' : 'Name'}</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>{isUa ? 'Роль' : 'Role'}</TableHead>
                                    <TableHead>{isUa ? 'Статус' : 'Status'}</TableHead>
                                    <TableHead>{isUa ? 'Картка' : 'Card'}</TableHead>
                                    <TableHead className="text-right">{isUa ? 'Дії' : 'Actions'}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-red-500">Error</TableCell>
                                    </TableRow>
                                ) : data?.content.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">No users found</TableCell>
                                    </TableRow>
                                ) : (
                                    data?.content.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>#{user.id}</TableCell>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.enabled ? "default" : "destructive"} className={user.enabled ? "bg-green-500 hover:bg-green-600" : ""}>
                                                    {user.enabled ? (isUa ? "Активний" : "Active") : (isUa ? "Заблокований" : "Banned")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.card ? `•••• ${user.card.slice(-4)}` : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> {isUa ? 'Редагувати' : 'Edit'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setRoleChangingUser(user)}>
                                                            <Shield className="mr-2 h-4 w-4" /> {isUa ? 'Змінити роль' : 'Change Role'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => statusMutation.mutate({ id: user.id, enabled: !user.enabled })}>
                                                            {user.enabled ? (
                                                                <><Ban className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">{isUa ? 'Заблокувати' : 'Ban'}</span></>
                                                            ) : (
                                                                <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> <span className="text-green-500">{isUa ? 'Активувати' : 'Activate'}</span></>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setDeletingUserId(user.id)} className="text-red-600 focus:text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> {isUa ? 'Видалити' : 'Delete'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((old) => Math.max(old - 1, 0))}
                            disabled={page === 0 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {isUa ? 'Попередня' : 'Previous'}
                        </Button>
                        <div className="text-sm font-medium">
                            {isUa ? 'Сторінка' : 'Page'} {page + 1} {isUa ? 'з' : 'of'} {Math.max(data?.totalPages || 0, 1)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((old) => old + 1)}
                            disabled={page >= (data?.totalPages || 1) - 1 || isLoading}
                        >
                            {isUa ? 'Наступна' : 'Next'}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* CREATE Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>{isUa ? 'Створити користувача' : 'Create User'}</DialogTitle>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={createForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isUa ? 'Ім\'я' : 'Name'}</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isUa ? 'Пароль' : 'Password'}</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={createForm.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isUa ? 'Роль' : 'Role'}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="CLIENT">Client</SelectItem>
                                                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {createRole === 'CLIENT' && (
                                    <FormField
                                        control={createForm.control}
                                        name="card"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>{isUa ? 'Картка' : 'Card'}</FormLabel>
                                                <FormControl><Input {...field} placeholder="0000 0000 0000 0000" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUa ? 'Створити' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* UPDATE Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>{isUa ? 'Редагувати користувача' : 'Edit User'}</DialogTitle>
                    </DialogHeader>
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={updateForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{isUa ? 'Ім\'я' : 'Name'}</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={updateForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {editingUser?.role === 'CLIENT' && (
                                    <FormField
                                        control={updateForm.control}
                                        name="card"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>{isUa ? 'Картка' : 'Card'}</FormLabel>
                                                <FormControl><Input {...field} placeholder="0000 0000 0000 0000" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUa ? 'Зберегти' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* CHANGE ROLE Dialog */}
            <Dialog open={!!roleChangingUser} onOpenChange={(open) => !open && setRoleChangingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isUa ? 'Змінити роль' : 'Change Role'}</DialogTitle>
                        <DialogDescription>
                            {isUa ? `Поточна роль: ${roleChangingUser?.role}` : `Current role: ${roleChangingUser?.role}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2 justify-center py-4">
                        <Button
                            variant={roleChangingUser?.role === 'CLIENT' ? 'default' : 'outline'}
                            onClick={() => roleChangingUser && roleMutation.mutate({ id: roleChangingUser.id, role: 'CLIENT' })}
                        >
                            Client
                        </Button>
                        <Button
                            variant={roleChangingUser?.role === 'EMPLOYEE' ? 'default' : 'outline'}
                            onClick={() => roleChangingUser && roleMutation.mutate({ id: roleChangingUser.id, role: 'EMPLOYEE' })}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                            Employee
                        </Button>
                        <Button
                            variant={roleChangingUser?.role === 'ADMIN' ? 'default' : 'outline'}
                            onClick={() => roleChangingUser && roleMutation.mutate({ id: roleChangingUser.id, role: 'ADMIN' })}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            Admin
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DELETE Alert */}
            <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isUa ? 'Видалити користувача?' : 'Delete User?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isUa ? 'Ця дія незворотна.' : 'This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{isUa ? 'Скасувати' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingUserId && deleteMutation.mutate(deletingUserId)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isUa ? 'Видалити' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
