import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NotFoundPage() {
  const navigate = useNavigate()

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
              404
            </CardTitle>
            <CardDescription className="text-lg">
              Oops! Page not found.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

