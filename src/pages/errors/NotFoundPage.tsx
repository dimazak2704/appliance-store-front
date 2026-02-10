import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <FileQuestion className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-6xl font-bold text-muted-foreground">
              {t('errorPages.notFound.title')}
            </CardTitle>
            <CardDescription className="text-lg">
              {t('errorPages.notFound.description')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('errorPages.notFound.message')}
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            {t('errorPages.notFound.goHome')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

