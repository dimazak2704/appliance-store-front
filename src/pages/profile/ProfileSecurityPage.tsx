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
        onError: () => {
            // Handle generic or specific errors (e.g., wrong current password)
            // For now assume generic
            toast.error(isUa ? 'Не вдалося змінити пароль. Перевірте поточний пароль.' : 'Failed to change password. Check your current password.');
        },
    });

    const onSubmit = (data: SecurityFormValues) => {
        passwordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isUa ? 'Безпека' : 'Security'}</CardTitle>
                <CardDescription>{isUa ? 'Змініть свій пароль для захисту акаунту' : 'Change your password to keep your account secure'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">{isUa ? "Поточний пароль" : "Current Password"}</Label>
                        <Input id="currentPassword" type="password" {...register('currentPassword')} />
                        {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">{isUa ? "Новий пароль" : "New Password"}</Label>
                        <Input id="newPassword" type="password" {...register('newPassword')} />
                        {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{isUa ? "Підтвердіть пароль" : "Confirm Password"}</Label>
                        <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>

                    <Button type="submit" disabled={passwordMutation.isPending}>
                        {passwordMutation.isPending ? (isUa ? 'Оновлення...' : 'Updating...') : (isUa ? 'Змінити пароль' : 'Update Password')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
