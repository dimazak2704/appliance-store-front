import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <ShieldX className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">{t('errorPages.forbidden.title')}</CardTitle>
            <CardDescription className="text-lg">
              {t('errorPages.forbidden.description')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('errorPages.forbidden.message')}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              {t('errorPages.forbidden.goBack')}
            </Button>
            <Button onClick={() => navigate('/login')} className="flex-1">
              {t('errorPages.forbidden.goLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

