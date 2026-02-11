import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { changePassword } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, Key } from 'lucide-react';
import { handleApiError } from '@/lib/errorHandler';

export function ProfileSecurityPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';

    const securitySchema = z.object({
        currentPassword: z.string().min(1, isUa ? "Введіть поточний пароль" : "Current password is required"),
        newPassword: z.string().min(8, isUa ? "Пароль має містити мінімум 8 символів" : "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, isUa ? "Підтвердіть пароль" : "Confirm password is required"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: isUa ? "Паролі не співпадають" : "Passwords do not match",
        path: ["confirmPassword"],
    });

    type SecurityFormValues = z.infer<typeof securitySchema>;

    const { register, handleSubmit, formState: { errors }, reset } = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success(isUa ? 'Пароль успішно змінено' : 'Password changed successfully');
            reset();
        },
        onError: (error) => {
            handleApiError(error, { fallbackMessage: 'errors.passwordChangeError' });
        },
    });

    const onSubmit = (data: SecurityFormValues) => {
        passwordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <Card className="border-none shadow-sm bg-card">
            <CardHeader className="pb-4 border-b mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">{isUa ? 'Безпека' : 'Security'}</CardTitle>
                        <CardDescription>{isUa ? 'Змініть свій пароль для захисту акаунту' : 'Change your password to keep your account secure'}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">{isUa ? "Поточний пароль" : "Current Password"}</Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="currentPassword" type="password" {...register('currentPassword')} className="pl-9" />
                        </div>
                        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">{isUa ? "Новий пароль" : "New Password"}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="newPassword" type="password" {...register('newPassword')} className="pl-9" />
                        </div>
                        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{isUa ? "Підтвердіть пароль" : "Confirm Password"}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="pl-9" />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={passwordMutation.isPending} className="w-full sm:w-auto min-w-[150px]">
                            {passwordMutation.isPending ? (isUa ? 'Оновлення...' : 'Updating...') : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    {isUa ? 'Змінити пароль' : 'Update Password'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
