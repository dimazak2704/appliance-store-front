import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ServerErrorPage() {
  const { t } = useTranslation()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">{t('errorPages.serverError.title')}</CardTitle>
            <CardDescription className="text-lg">
              {t('errorPages.serverError.description')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('errorPages.serverError.message')}
          </p>
          <Button onClick={handleRefresh} className="w-full">
            {t('errorPages.serverError.refresh')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

