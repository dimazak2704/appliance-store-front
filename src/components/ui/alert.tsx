import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

interface AlertWithDismissProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof alertVariants>["variant"]
  onDismiss?: () => void
  title?: string
  children: React.ReactNode
}

const AlertWithDismiss = React.forwardRef<HTMLDivElement, AlertWithDismissProps>(
  ({ className, variant, onDismiss, title, children, ...props }, ref) => (
    <Alert ref={ref} variant={variant} className={cn("pr-10", className)} {...props}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-md p-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
)
AlertWithDismiss.displayName = "AlertWithDismiss"

export { Alert, AlertTitle, AlertDescription, AlertWithDismiss }

