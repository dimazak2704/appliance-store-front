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
import { User, Mail, CreditCard, Save } from 'lucide-react';

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
            handleApiError(error);
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
        <Card className="border-none shadow-sm bg-card">
            <CardHeader className="pb-4 border-b mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">{t('profile.personalInfo')}</CardTitle>
                        <CardDescription>{t('profile.updateInfo')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-muted-foreground">{t('auth.email')}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="email" {...register('email')} disabled className="pl-9 bg-muted/50 border-muted" />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pl-1">
                            {t('profile.emailNoChange')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">{t('auth.name')}</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="name" {...register('name')} className="pl-9" />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="card">{t('auth.cardNumber')}</Label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                id="card"
                                {...register('card')}
                                onChange={(e) => {
                                    e.target.value = formatCardNumber(e.target.value);
                                    register('card').onChange(e);
                                }}
                                placeholder={t('profile.cardPlaceholder')}
                                maxLength={19}
                                className="pl-9 font-mono"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto min-w-[150px]">
                            {updateMutation.isPending ? t('profile.saving') : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('profile.saveChanges')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
