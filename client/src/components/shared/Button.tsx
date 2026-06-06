import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-[#CF1432] text-white hover:bg-white hover:text-[#CF1432] border border-[#CF1432] focus:ring-[#CF1432]",
        outline: "bg-white text-[#CF1432] border border-[#CF1432] hover:bg-[#CF1432] hover:text-white focus:ring-[#CF1432]",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300",
        success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      },
      size: {
        sm: "px-4 py-1.5 text-sm",
        md: "px-6 py-2 text-sm",
        lg: "px-8 py-3 text-base",
        icon: "p-2",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };
