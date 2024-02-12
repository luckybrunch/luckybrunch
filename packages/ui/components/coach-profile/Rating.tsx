import { useState } from "react";
import { HiStar } from "react-icons/hi";

import { classNames } from "@calcom/lib";

function Stars(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={100}
      height={20}
      viewBox="0 0 100 20"
      preserveAspectRatio="xMinYMid slice"
      fill="currentColor"
      {...props}>
      <path d="M9.049 2.927c.3-.92 1.603-.92 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292h-.001ZM29.049 2.927c.3-.92 1.603-.92 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L22.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292h-.001ZM49.049 2.927c.3-.92 1.603-.92 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L42.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292h-.001ZM69.049 2.927c.3-.92 1.603-.92 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L62.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292h-.001ZM89.049 2.927c.3-.92 1.603-.92 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L82.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292h-.001Z" />
    </svg>
  );
}

export interface RatingProps {
  rating: number;
  size?: "md" | "lg";
}

export function Rating({ rating, size = "md" }: RatingProps) {
  rating = Math.max(0, Math.min(5, rating));
  const h = {
    md: "h-5",
    lg: "h-6",
  }[size];
  return (
    <div className={classNames("relative", h)} aria-hidden="true">
      <Stars className="h-full w-auto text-gray-300" />
      <div className="absolute inset-0 overflow-clip" style={{ marginRight: `${100 - rating * 20}%` }}>
        <Stars className="text-brand-400 h-full w-auto" />
      </div>
    </div>
  );
}

export interface RatingInputProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function RatingInput({ value, onValueChange }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  return (
    <div className="flex flex-row items-center" onPointerOut={() => setHoverValue(null)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onValueChange(i)}
          onPointerOver={() => setHoverValue(i)}
          className={classNames(
            (hoverValue ?? value) >= i ? "text-brand-500" : "text-gray-300",
            "transform transition-transform duration-75 ease-in-out hover:scale-110",
            "focus-visible:ring-brand-500 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          )}>
          <HiStar className="h-8 w-8" />
        </button>
      ))}
    </div>
  );
}
