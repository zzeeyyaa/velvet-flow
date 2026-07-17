"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={`flex flex-col w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 text-sm font-medium text-[#2C2825] dark:text-[#FDFBF7]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-11 bg-[#FFFFFF] dark:bg-[#1A1817]/50 border text-sm rounded-xl px-4 py-2 text-[#2C2825] dark:text-[#FDFBF7] placeholder:text-[#9C958E] dark:placeholder:text-[#7A726D] focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200
              ${
                error
                  ? "border-red-300 focus:border-[#C83E4D] focus:ring-[#C83E4D]/20 dark:border-red-900/50 dark:focus:border-[#D44D5C]"
                  : "border-[#EAE6E1] focus:border-[#597864] focus:ring-[#597864]/20 dark:border-[#36322F] dark:focus:border-[#6B8E7B]"
              }
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-zinc-400 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-xs ${
              error ? "text-[#C83E4D] dark:text-[#D44D5C]" : "text-[#7A726D] dark:text-[#9C958E]"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
