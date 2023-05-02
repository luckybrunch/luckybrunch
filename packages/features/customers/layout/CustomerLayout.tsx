import React, { ComponentProps } from "react";

import Shell from "@calcom/features/shell/Shell";
import { VerticalTabItemProps, HorizontalTabItemProps, HorizontalTabs } from "@calcom/ui";

const translationKeys = {
  information: "lb_customers_nav_information",
  chat: "lb_customers_nav_chat",
  clientBookings: "lb_customers_nav_bookings",
  notes: "lb_customers_nav_notes",
};

const tabs: (VerticalTabItemProps | HorizontalTabItemProps)[] = [
  {
    name: translationKeys.information,
    href: "/customer-details/information",
  },
  {
    name: translationKeys.chat,
    href: "/customer-details/chat",
  },
  {
    name: translationKeys.clientBookings,
    href: "/customer-details/bookings",
  },
  {
    name: translationKeys.notes,
    href: "/customer-details/notes",
  },
];

export default function CustomerLayout({
  children,
  email,
  ...rest
}: { children: React.ReactNode; email: string } & ComponentProps<typeof Shell>) {
  return (
    <Shell {...rest}>
      <div className="flex max-w-6xl flex-col">
        <div className="flex flex-col lg:flex-row">
          <HorizontalTabs
            tabs={tabs.map((tab) => {
              const tabWithUserDetails = {
                ...tab,
                href: `${tab.href}?email=${email}`,
              };

              return tabWithUserDetails;
            })}
          />
        </div>
        <main className="w-full max-w-6xl">{children}</main>
      </div>
    </Shell>
  );
}
