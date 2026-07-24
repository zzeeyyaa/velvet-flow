"use client";

import React from "react";
import Button from "./Button";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl?: string;
  onBuyTicket?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  date,
  location,
  price,
  availableTickets,
  imageUrl,
  onBuyTicket,
}) => {
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="group relative flex flex-col bg-[#FFFFFF] dark:bg-[#242220] rounded-2xl border border-[#EAE6E1] dark:border-[#36322F] overflow-hidden hover:shadow-xl hover:shadow-[#C83E4D]/5 transition-all duration-300">
      {/* Optional Image / Gradient Background */}
      <div className="h-48 w-full bg-gradient-to-br from-[#FDFBF7] to-[#EAE6E1] dark:from-[#1A1817] dark:to-[#242220] relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-50">🎫</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md ${
              isSoldOut
                ? "bg-[#C83E4D]/90 text-white shadow-sm"
                : "bg-white/90 text-[#597864] dark:bg-[#36322F]/90 dark:text-[#9C958E] shadow-sm"
            }`}
          >
            {isSoldOut ? "SOLD OUT" : `${availableTickets} Left`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-bold text-[#2C2825] dark:text-[#FDFBF7] line-clamp-2">
            {title}
          </h3>
          <span className="text-lg font-black text-[#C83E4D] dark:text-[#D44D5C]">
            ${price}
          </span>
        </div>
        
        <p className="text-sm text-[#7A726D] dark:text-[#9C958E] line-clamp-2 mb-4">
          {description}
        </p>

        <div className="space-y-2 mt-auto mb-6 text-xs text-[#7A726D] dark:text-[#9C958E] font-medium">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#9C958E] dark:text-[#7A726D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {date}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#9C958E] dark:text-[#7A726D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {location}
          </div>
        </div>

        {/* Action */}
        <Button
          variant={isSoldOut ? "secondary" : "primary"}
          disabled={isSoldOut}
          onClick={() => onBuyTicket && onBuyTicket(id)}
          className="w-full"
        >
          {isSoldOut ? "Sold Out" : "Buy Ticket"}
        </Button>
      </div>
    </div>
  );
};

export default EventCard;
