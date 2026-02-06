import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ServerErrorPage() {
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
            <CardTitle className="text-3xl font-bold">Internal Server Error</CardTitle>
            <CardDescription className="text-lg">
              Something went wrong on our end.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We're working to fix the issue. Please try again in a few moments.
          </p>
          <Button onClick={handleRefresh} className="w-full">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

