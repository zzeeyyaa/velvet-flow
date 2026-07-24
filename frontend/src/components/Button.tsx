"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-[#C83E4D] text-[#FDFBF7] hover:bg-[#A6313E] focus:ring-[#C83E4D] shadow-md shadow-[#C83E4D]/20 dark:bg-[#D44D5C] dark:hover:bg-[#C83E4D] dark:shadow-[#D44D5C]/20",
      secondary:
        "bg-[#EAE6E1] text-[#2C2825] hover:bg-[#DFD9D1] focus:ring-[#597864] dark:bg-[#36322F] dark:text-[#FDFBF7] dark:hover:bg-[#46403C]",
      outline:
        "border border-[#EAE6E1] text-[#2C2825] hover:bg-[#F5F2EE] focus:ring-[#597864] dark:border-[#36322F] dark:text-[#9C958E] dark:hover:bg-[#242220]",
      ghost:
        "text-[#2C2825] hover:bg-[#F5F2EE] focus:ring-[#597864] dark:text-[#9C958E] dark:hover:bg-[#242220]",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
