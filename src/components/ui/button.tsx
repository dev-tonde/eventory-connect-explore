/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:font-semibold hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:font-semibold hover:shadow-[0_0_20px_hsl(var(--destructive)/0.5)]",
        outline:
          "border border-input bg-background text-foreground hover:font-semibold hover:shadow-[0_0_15px_hsl(var(--border)/0.8)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:font-semibold hover:shadow-[0_0_15px_hsl(var(--secondary)/0.8)]",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground hover:font-semibold hover:shadow-[0_0_10px_hsl(var(--accent)/0.6)]",
        link: "text-primary underline-offset-4 hover:underline hover:font-semibold",
        white:
          "bg-white text-purple border border-purple/20 hover:font-semibold hover:shadow-[0_0_20px_hsl(var(--purple)/0.4)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Accessibility: ensure aria-disabled and tabIndex for non-button elements
    const accessibilityProps =
      asChild && typeof Comp !== "string"
        ? {
            "aria-disabled": disabled,
            ...(disabled && { tabIndex: -1 }),
          }
        : {};

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={asChild ? undefined : disabled}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
// This component provides a customizable button UI using class-variance-authority for styling.
