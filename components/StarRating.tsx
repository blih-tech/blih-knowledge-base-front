"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          className={`p-0.5 transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange?.(n)}
        >
          <Star className={`w-5 h-5 ${(hover || value) >= n ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}
