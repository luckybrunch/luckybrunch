import { ReactNode } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";

export type TrafficLightBannerProps = {
  color: "green" | "red" | "yellow";
  date?: Date | null;
  rejectionReason?: string | null;
  buttonRaw?: ReactNode;
  icon?: ReactNode;
  text: string;
  title: string;
};

export function TrafficLightBanner({
  color,
  date,
  icon,
  buttonRaw,
  text,
  title,
  rejectionReason,
}: TrafficLightBannerProps) {
  const { t } = useLocale();

  const colorMap = {
    red: {
      bannerColor: "border-red-400 bg-red-50 p-3 text-red-400 ",
    },
    yellow: {
      bannerColor: "bg-beige-50 text-beige-600 border-beige-600",
    },
    green: {
      bannerColor: "bg-brand-50 text-brand-500 border-brand-500",
    },
    gray: {
      bannerColor: "bg-gray-100 rounded-md text-gray-500 border-gray-200",
    },
  };

  const { bannerColor } = colorMap[color];

  return (
    <div
      className={`mb-2 flex h-auto w-full items-center justify-between space-x-2 rounded-md border p-4 text-sm rtl:space-x-reverse ${bannerColor}`}>
      <div className="my-1 flex flex-col gap-3">
        <div className="mb-1 flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        <p className="text-xs">
          {date && (
            <span className="font-bold">
              {date.toLocaleDateString()} at {date.toLocaleTimeString()}:{" "}
            </span>
          )}
          {text}
        </p>
        {rejectionReason && (
          <p className="text-xs">
            <span className="font-bold">{t("lb_rejection_reason")}: </span>
            {rejectionReason}
          </p>
        )}
      </div>
      <div>{buttonRaw}</div>
    </div>
  );
}
