import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod'; // Assuming installed
import { zodResolver } from '@hookform/resolvers/zod'; // Assuming installed
import { toast } from 'sonner'; // Assuming installed
import { getProfile, updateProfile } from '@/api/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function ProfileInfoPage() {
    const { i18n } = useTranslation();
    const isUa = i18n.language === 'ua';
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    // Dynamic schema for localization
    const profileSchema = z.object({
        name: z.string().min(2, isUa ? "Ім'я має містити мінімум 2 символи" : "Name must be at least 2 characters"),
        email: z.string().email(),
        card: z.string().optional(),
    });

    type ProfileFormValues = z.infer<typeof profileSchema>;

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        values: profile ? {
            name: profile.name,
            email: profile.email,
            card: profile.card || '',
        } : undefined,
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(['profile'], data);
            toast.success(isUa ? 'Профіль оновлено успішно' : 'Profile updated successfully');
        },
        onError: () => {
            toast.error(isUa ? 'Помилка оновлення профілю' : 'Failed to update profile');
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateMutation.mutate({
            name: data.name,
            card: data.card,
        });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isUa ? 'Особисті дані' : 'Personal Information'}</CardTitle>
                <CardDescription>{isUa ? 'Оновіть свої особисті дані та платіжну інформацію' : 'Update your personal details and payment information'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" {...register('email')} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">
                            {isUa ? 'Email не можна змінити' : 'Email cannot be changed'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">{isUa ? "Ім'я" : "Name"}</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card">{isUa ? "Номер карти (Опціонально)" : "Card Number (Optional)"}</Label>
                        <Input id="card" {...register('card')} placeholder="0000 0000 0000 0000" />
                        {/* Basic card input, masks/formatting would be a nice addition later */}
                    </div>

                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (isUa ? 'Збереження...' : 'Saving...') : (isUa ? 'Зберегти зміни' : 'Save Changes')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
