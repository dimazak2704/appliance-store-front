import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative">{children}</div>
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "end", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" ? "right-0" : "left-0",
        "absolute mt-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: (event: Event) => void
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, onSelect, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
        className
      )}
      onClick={(e) => {
        onSelect?.(e.nativeEvent)
        props.onClick?.(e)
      }}
      {...props}
    />
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }

