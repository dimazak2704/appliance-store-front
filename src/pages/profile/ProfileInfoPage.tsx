import { useForm } from 'react-hook-form';
import { formatCardNumber } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getProfile, updateProfile } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { handleApiError } from '@/lib/errorHandler';

export function ProfileInfoPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    // Dynamic schema for localization
    const profileSchema = z.object({
        name: z.string().min(2, t('profile.validation.nameMin')),
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
            toast.success(t('profile.successUpdate'));
        },
        onError: (error) => {
            handleApiError(error, {
                setGlobalError: (message: string) => toast.error(message),
            });
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateMutation.mutate({
            name: data.name,
            card: data.card?.replace(/\s/g, ''),
        });
    };

    if (isLoading) return <div>{t('buttons.loading')}</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('profile.personalInfo')}</CardTitle>
                <CardDescription>{t('profile.updateInfo')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input id="email" {...register('email')} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">
                            {t('profile.emailNoChange')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">{t('auth.name')}</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card">{t('auth.cardNumber')}</Label>
                        <Input
                            id="card"
                            {...register('card')}
                            onChange={(e) => {
                                e.target.value = formatCardNumber(e.target.value);
                                register('card').onChange(e);
                            }}
                            placeholder={t('profile.cardPlaceholder')}
                            maxLength={19}
                        />
                    </div>

                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
