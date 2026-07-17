"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidthClass} bg-[#FFFFFF] dark:bg-[#242220] border border-[#EAE6E1] dark:border-[#36322F] rounded-2xl shadow-[0_20px_60px_-15px_rgba(200,62,77,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(212,77,92,0.1)] overflow-hidden transform transition-all animate-in fade-in zoom-in-90 duration-300 ease-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6E1] dark:border-[#36322F]">
          <h2 className="text-lg font-bold text-[#2C2825] dark:text-[#FDFBF7]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#9C958E] hover:text-[#597864] dark:hover:text-[#FDFBF7] rounded-full hover:bg-[#F5F2EE] dark:hover:bg-[#36322F] transition-colors focus:outline-none"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
