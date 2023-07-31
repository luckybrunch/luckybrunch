import { ReactNode } from "react";

import { HorizontalTabs, HorizontalTabItemProps } from "@calcom/ui";

type TabKey = "profile";

type TabLayoutForMdAndLessProps = {
  children: ReactNode;
  tabsFor: TabKey;
};

const tabs: Record<TabKey, HorizontalTabItemProps[]> = {
  profile: [
    { name: "lb_tab_information", href: "/profile/information" },
    { name: "lb_tab_certificates", href: "/profile/certificates" },
    { name: "lb_tab_services", href: "/profile/services" },
  ],
};

export const TabLayoutForMdAndLess = ({ children, tabsFor }: TabLayoutForMdAndLessProps) => {
  return (
    <>
      <div className="relative lg:hidden">
        <HorizontalTabs tabs={tabs[tabsFor]} />
      </div>
      <main>{children}</main>
    </>
  );
};
