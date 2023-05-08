import React, { ComponentProps } from "react";

import Shell from "@calcom/features/shell/Shell";
import { VerticalTabItemProps, HorizontalTabItemProps, HorizontalTabs } from "@calcom/ui";

const translationKeys = {
  information: "lb_clients_nav_information",
  chat: "lb_clients_nav_chat",
  clientBookings: "lb_clients_nav_bookings",
  notes: "lb_clients_nav_notes",
};

const tabs: (VerticalTabItemProps | HorizontalTabItemProps)[] = [
  {
    name: translationKeys.information,
    href: "/client-details/information",
  },
  {
    name: translationKeys.chat,
    href: "/client-details/chat",
  },
  {
    name: translationKeys.clientBookings,
    href: "/client-details-details/bookings",
  },
  {
    name: translationKeys.notes,
    href: "/client-details/notes",
  },
];

export default function ClientLayout({
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
