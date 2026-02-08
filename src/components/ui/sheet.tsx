import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative w-full max-w-md bg-background shadow-xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
                {children}
            </div>
        </div>
    );
}

export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-6 flex-1 overflow-y-auto", className)}>{children}</div>;
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("flex flex-col space-y-2 text-center sm:text-left p-6 border-b", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn("text-lg font-semibold text-foreground", className)}>{children}</h2>;
}

export function SheetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-6 border-t mt-auto", className)}>{children}</div>;
}
