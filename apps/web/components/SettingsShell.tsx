import React, { ComponentProps } from "react";

import Shell from "@calcom/features/shell/Shell";
import { ErrorBoundary } from "@calcom/ui";
import { FiKey, FiLock, FiUser } from "@calcom/ui/components/icon";

import NavTabs from "./NavTabs";

const tabs = [
  {
    name: "profile",
    href: "/settings/my-account",
    icon: FiUser,
  },
  // {
  //   name: "teams",
  //   href: "/settings/teams",
  //   icon: FiUsers,
  // },
  {
    name: "security",
    href: "/settings/security",
    icon: FiKey,
  },
  // {
  //   name: "developer",
  //   href: "/settings/developer",
  //   icon: FiTerminal,
  // },
  // {
  //   name: "billing",
  //   href: "/settings/billing",
  //   icon: FiCreditCard,
  // },
  {
    name: "admin",
    href: "/settings/admin",
    icon: FiLock,
    adminRequired: true,
  },
];

export default function SettingsShell({
  children,
  ...rest
}: { children: React.ReactNode } & ComponentProps<typeof Shell>) {
  return (
    <Shell {...rest}>
      <div className="sm:mx-auto">
        <NavTabs tabs={tabs} />
      </div>
      <main className="max-w-4xl">
        <>
          <ErrorBoundary>{children}</ErrorBoundary>
        </>
      </main>
    </Shell>
  );
}
