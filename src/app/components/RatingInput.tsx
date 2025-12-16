"use client";

import { useState } from "react";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export default function RatingInput({ 
  value, 
  onChange, 
  size = "md",
  disabled = false 
}: RatingInputProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const displayRating = hoveredRating || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !disabled && setHoveredRating(rating)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`${sizeClasses[size]} transition-colors ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
          }`}
        >
          <svg
            className={`${sizeClasses[size]} ${
              rating <= displayRating
                ? "text-yellow-400 fill-current"
                : "text-gray-400 fill-current"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

