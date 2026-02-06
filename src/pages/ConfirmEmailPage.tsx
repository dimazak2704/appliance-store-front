import React, { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/features/auth/authService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const hasCalledRef = useRef(false)

  const confirmEmailMutation = useMutation({
    mutationFn: authService.confirmEmail,
    onSuccess: () => {
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    },
  })

  useEffect(() => {
    // Prevent double firing in React.StrictMode
    if (token && !hasCalledRef.current && !confirmEmailMutation.isPending && !confirmEmailMutation.isSuccess && !confirmEmailMutation.isError) {
      hasCalledRef.current = true
      confirmEmailMutation.mutate(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Token</CardTitle>
            <CardDescription>
              The confirmation link is invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirming Email</CardTitle>
          <CardDescription>
            Please wait while we confirm your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {confirmEmailMutation.isPending && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Confirming your email...
              </p>
            </>
          )}

          {confirmEmailMutation.isSuccess && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Email confirmed successfully! Redirecting to login...
              </p>
            </>
          )}

          {confirmEmailMutation.isError && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-destructive">
                {confirmEmailMutation.error instanceof Error
                  ? confirmEmailMutation.error.message
                  : 'Failed to confirm email. The link may be invalid or expired.'}
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

