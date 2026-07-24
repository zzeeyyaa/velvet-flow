"use client";

import React, { useState } from "react";

export interface AccordionItem {
  id: string;
  title: string | React.ReactNode;
  content: string | React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
}

export default function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`border rounded-xl transition-all duration-300 overflow-hidden ${
              isOpen
                ? "border-[#C83E4D]/50 shadow-[0_4px_20px_-4px_rgba(200,62,77,0.15)] bg-[#FDFBF7] dark:bg-[#242220] dark:border-[#D44D5C]/40"
                : "border-[#EAE6E1] dark:border-[#36322F] hover:border-[#597864]/30 dark:hover:border-[#6B8E7B]/30 bg-[#FFFFFF] dark:bg-[#1A1817]"
            }`}
          >
            <button
              className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
              onClick={() => toggle(item.id)}
            >
              <div className="flex-1 font-bold text-[#2C2825] dark:text-[#FDFBF7]">
                {item.title}
              </div>
              <div
                className={`ml-4 transform transition-transform duration-300 text-[#9C958E] flex-shrink-0 ${
                  isOpen ? "rotate-180 text-[#C83E4D] dark:text-[#D44D5C]" : ""
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-4 pt-0 text-sm text-[#7A726D] dark:text-[#9C958E]">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
