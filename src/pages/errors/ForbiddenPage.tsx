import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForbiddenPage() {
  const navigate = useNavigate()

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
            <CardTitle className="text-3xl font-bold">Access Denied</CardTitle>
            <CardDescription className="text-lg">
              You don't have permission to access this resource.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button onClick={() => navigate('/login')} className="flex-1">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

