import { UserType, User } from "@prisma/client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import React, { Dispatch, Fragment, ReactNode, SetStateAction, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import dayjs from "@calcom/dayjs";
import { useIsEmbed } from "@calcom/embed-core/embed-iframe";
import UnconfirmedBookingBadge from "@calcom/features/bookings/UnconfirmedBookingBadge";
import { UnreadMessagesBadge } from "@calcom/features/chat";
import ReviewStatusBanner from "@calcom/features/coaches/components/ReviewStatusBanner";
import ImpersonatingBanner from "@calcom/features/ee/impersonation/components/ImpersonatingBanner";
import HelpMenuItem from "@calcom/features/ee/support/components/HelpMenuItem";
import { TeamsUpgradeBanner } from "@calcom/features/ee/teams/components";
import { KBarContent, KBarRoot } from "@calcom/features/kbar/Kbar";
import TimezoneChangeDialog from "@calcom/features/settings/TimezoneChangeDialog";
import AdminPasswordBanner from "@calcom/features/users/components/AdminPasswordBanner";
import CustomBranding from "@calcom/lib/CustomBranding";
import classNames from "@calcom/lib/classNames";
import { APP_NAME, WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useTheme from "@calcom/lib/hooks/useTheme";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { SVGComponent } from "@calcom/types/SVGComponent";
import {
  Button,
  Credits,
  Dropdown,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  ErrorBoundary,
  Logo,
  HeadSeo,
  showToast,
  SkeletonText,
} from "@calcom/ui";
import {
  FiMoreVertical,
  FiExternalLink,
  FiLink,
  FiLogOut,
  FiCalendar,
  FiUsers,
  FiMoreHorizontal,
  FiSettings,
  FiArrowRight,
  FiArrowLeft,
  FiTrello,
  FiUser,
  FiCompass,
} from "@calcom/ui/components/icon";

/* TODO: Migate this */

export const ONBOARDING_INTRODUCED_AT = dayjs("September 1 2021").toISOString();

export const ONBOARDING_NEXT_REDIRECT = {
  redirect: {
    permanent: false,
    destination: "/getting-started",
  },
} as const;

export const shouldShowOnboarding = (
  user: Pick<User, "createdDate" | "completedOnboarding" | "userType">
) => {
  return (
    user.userType === "COACH" &&
    !user.completedOnboarding &&
    dayjs(user.createdDate).isAfter(ONBOARDING_INTRODUCED_AT)
  );
};

function useRedirectToLoginIfUnauthenticated(isPublic = false) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();

  useEffect(() => {
    if (isPublic) {
      return;
    }

    if (!loading && !session) {
      router.replace({
        pathname: "/auth/login",
        query: {
          callbackUrl: `${WEBAPP_URL}${location.pathname}${location.search}`,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, isPublic]);

  return {
    loading: loading && !session,
    session,
  };
}

function useRedirectToOnboardingIfNeeded() {
  const router = useRouter();
  const query = useMeQuery();
  const user = query.data;

  const isRedirectingToOnboarding = user && shouldShowOnboarding(user);

  useEffect(() => {
    if (isRedirectingToOnboarding) {
      router.replace({
        pathname: "/getting-started",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRedirectingToOnboarding]);
  return {
    isRedirectingToOnboarding,
  };
}

const Layout = (props: LayoutProps) => {
  const pageTitle = typeof props.heading === "string" && !props.title ? props.heading : props.title;

  return (
    <>
      {!props.withoutSeo && (
        <HeadSeo
          title={pageTitle ?? APP_NAME}
          description={props.subtitle ? props.subtitle?.toString() : ""}
        />
      )}
      <div>
        <Toaster position="bottom-right" />
      </div>

      {/* todo: only run this if timezone is different */}
      <TimezoneChangeDialog />
      <div className="flex min-h-screen flex-col">
        <div className="divide-y divide-black">
          <TeamsUpgradeBanner />
          <ImpersonatingBanner />
          <AdminPasswordBanner />
          <ReviewStatusBanner />
        </div>
        <div className="flex flex-1" data-testid="dashboard-shell">
          {props.SidebarContainer || <SideBarContainer />}
          <div className="flex w-0 flex-1 flex-col">
            <MainContainer {...props} />
          </div>
        </div>
      </div>
    </>
  );
};

type DrawerState = [isOpen: boolean, setDrawerOpen: Dispatch<SetStateAction<boolean>>];

type LayoutProps = {
  centered?: boolean;
  title?: string;
  heading?: ReactNode;
  subtitle?: ReactNode;
  headerClassName?: string;
  children: ReactNode;
  CTA?: ReactNode;
  large?: boolean;
  MobileNavigationContainer?: ReactNode;
  SidebarContainer?: ReactNode;
  TopNavContainer?: ReactNode;
  drawerState?: DrawerState;
  HeadingLeftIcon?: ReactNode;
  backPath?: string | boolean; // renders back button to specified path
  // use when content needs to expand with flex
  flexChildrenContainer?: boolean;
  isPublic?: boolean;
  withoutMain?: boolean;
  // Gives you the option to skip HeadSEO and render your own.
  withoutSeo?: boolean;
  // Gives the ability to include actions to the right of the heading
  actions?: JSX.Element;
  smallHeading?: boolean;
};

const CustomBrandingContainer = () => {
  const { data: user } = useMeQuery();
  return <CustomBranding lightVal={user?.brandColor} darkVal={user?.darkBrandColor} />;
};

const KBarWrapper = ({ children, withKBar = false }: { withKBar: boolean; children: React.ReactNode }) =>
  withKBar ? (
    <KBarRoot>
      {children}
      <KBarContent />
    </KBarRoot>
  ) : (
    <>{children}</>
  );

const PublicShell = (props: LayoutProps) => {
  const { status } = useSession();
  return (
    <KBarWrapper withKBar={status === "authenticated"}>
      <CustomBrandingContainer />
      <Layout {...props} />
    </KBarWrapper>
  );
};

export default function Shell(props: LayoutProps) {
  // if a page is unauthed and isPublic is true, the redirect does not happen.
  useRedirectToLoginIfUnauthenticated(props.isPublic);
  useRedirectToOnboardingIfNeeded();
  useTheme("light");

  return !props.isPublic ? (
    <KBarWrapper withKBar>
      <CustomBrandingContainer />
      <Layout {...props} />
    </KBarWrapper>
  ) : (
    <PublicShell {...props} />
  );
}

function UserDropdown({ small }: { small?: boolean }) {
  const { t } = useLocale();
  const query = useMeQuery();
  const user = query.data;
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const Beacon = window.Beacon;
    // window.Beacon is defined when user actually opens up HelpScout and username is available here. On every re-render update session info, so that it is always latest.
    Beacon &&
      Beacon("session-data", {
        username: user?.username || "Unknown",
        screenResolution: `${screen.width}x${screen.height}`,
      });
  });
  const mutation = trpc.viewer.away.useMutation({
    onSettled() {
      utils.viewer.me.invalidate();
    },
  });
  const utils = trpc.useContext();
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) {
    return null;
  }
  const onHelpItemSelect = () => {
    setHelpOpen(false);
    setMenuOpen(false);
  };

  // Prevent rendering dropdown if user isn't available.
  // We don't want to show nameless user.
  if (!user) {
    return null;
  }
  return (
    <Dropdown open={menuOpen}>
      <div className="ltr:sm:-ml-5 rtl:sm:-mr-5">
        <DropdownMenuTrigger asChild onClick={() => setMenuOpen((menuOpen) => !menuOpen)}>
          <button className="radix-state-open:bg-gray-200 group mx-0 flex w-full cursor-pointer appearance-none items-center rounded-full p-2 text-left outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 sm:mx-2.5 sm:pl-3 md:rounded-none lg:rounded lg:pl-2">
            <span
              className={classNames(
                small ? "h-6 w-6 md:ml-3" : "h-8 w-8 ltr:mr-2 rtl:ml-2",
                "relative flex-shrink-0 rounded-full bg-gray-300 "
              )}>
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="rounded-full"
                  src={WEBAPP_URL + "/" + user.username + "/avatar.png"}
                  alt={user.username || "Nameless User"}
                />
              }
              {!user.away && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              )}
              {user.away && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-yellow-500" />
              )}
            </span>
            {!small && (
              <span className="flex flex-grow items-center truncate">
                <span className="flex-grow truncate text-sm">
                  <span className="mb-1 block truncate font-medium leading-none text-gray-900">
                    {user.name || "Nameless User"}
                  </span>
                </span>
                <FiMoreVertical
                  className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500 ltr:mr-2 rtl:ml-2 rtl:mr-4"
                  aria-hidden="true"
                />
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuPortal>
        <DropdownMenuContent
          onInteractOutside={() => {
            setMenuOpen(false);
            setHelpOpen(false);
          }}
          className="overflow-hidden rounded-md">
          {helpOpen ? (
            <HelpMenuItem onHelpItemSelect={() => onHelpItemSelect()} />
          ) : (
            <>
              {/* <DropdownMenuItem>
                <DropdownItem
                  type="button"
                  StartIcon={(props) => (
                    <FiMoon
                      className={classNames(
                        user.away
                          ? "text-purple-500 group-hover:text-purple-700"
                          : "text-gray-500 group-hover:text-gray-700",
                        props.className
                      )}
                      aria-hidden="true"
                    />
                  )}
                  onClick={() => {
                    mutation.mutate({ away: !user?.away });
                    utils.viewer.me.invalidate();
                  }}>
                  {user.away ? t("set_as_free") : t("set_as_away")}
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuSeparator /> */}
              {user.username && (
                <>
                  <DropdownMenuItem>
                    <DropdownItem
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/coach/${user.username}`}
                      StartIcon={FiExternalLink}>
                      {t("view_public_page")}
                    </DropdownItem>
                  </DropdownMenuItem>
                  {/* PUBLIC PAGE  */}
                  <DropdownMenuItem>
                    <DropdownItem
                      type="button"
                      StartIcon={FiLink}
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_WEBSITE_URL}/coach/${user.username}`
                        );
                        showToast(t("link_copied"), "success");
                      }}>
                      {t("copy_public_page_link")}
                    </DropdownItem>
                  </DropdownMenuItem>
                </>
              )}
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DropdownItem
                  StartIcon={(props) => <FiSlack strokeWidth={1.5} {...props} />}
                  target="_blank"
                  rel="noreferrer"
                  href={JOIN_SLACK}>
                  {t("join_our_slack")}
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownItem StartIcon={FiMap} target="_blank" href={ROADMAP}>
                  {t("visit_roadmap")}
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownItem
                  type="button"
                  StartIcon={(props) => <FiHelpCircle aria-hidden="true" {...props} />}
                  onClick={() => setHelpOpen(true)}>
                  {t("help")}
                </DropdownItem>
              </DropdownMenuItem>
              <DropdownMenuItem className="desktop-hidden hidden lg:flex">
                <DropdownItem StartIcon={FiDownload} target="_blank" rel="noreferrer" href={DESKTOP_APP_LINK}>
                  {t("download_desktop_app")}
                </DropdownItem>
              </DropdownMenuItem>

              <DropdownMenuSeparator /> */}
              <DropdownMenuItem>
                <DropdownItem
                  type="button"
                  StartIcon={(props) => <FiLogOut aria-hidden="true" {...props} />}
                  onClick={() => signOut({ callbackUrl: "/auth/logout" })}>
                  {t("sign_out")}
                </DropdownItem>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </Dropdown>
  );
}

export type NavigationItemType = {
  name: string;
  href: string;
  badge?: React.ReactNode;
  icon?: SVGComponent;
  child?: NavigationItemType[];
  pro?: true;
  onlyMobile?: boolean;
  onlyDesktop?: boolean;
  isCurrent?: ({
    item,
    isChild,
    router,
  }: {
    item: NavigationItemType;
    isChild?: boolean;
    router: NextRouter;
  }) => boolean;
};

const requiredCredentialNavigationItems = ["Routing Forms"];
const MORE_SEPARATOR_NAME = "more";

enum DashboardItem {
  DASHBOARD,
  BOOKINGS,
  CLIENTS,
  PROFILE,
  MORE_SEPARATOR,
  SETTINGS,
  COACHES,
  DISCOVER,
}

const navigation: ({ itemId: DashboardItem } & NavigationItemType)[] = [
  {
    itemId: DashboardItem.DASHBOARD,
    name: "lb_dashboard",
    href: "/dashboard",
    icon: FiTrello,
  },
  {
    itemId: DashboardItem.BOOKINGS,
    name: "bookings",
    href: "/bookings/upcoming",
    icon: FiCalendar,
    badge: <UnconfirmedBookingBadge />,
    isCurrent: ({ router }) => {
      const path = router.asPath.split("?")[0];
      return path.startsWith("/bookings");
    },
  },
  {
    itemId: DashboardItem.CLIENTS,
    name: "lb_clients",
    href: "/clients",
    badge: <UnreadMessagesBadge />,
    icon: FiUsers,
  },
  {
    itemId: DashboardItem.PROFILE,
    name: "lb_profile",
    href: "/profile/information",
    icon: FiUser,
    isCurrent: ({ router }) => {
      const path = router.asPath.split("?")[0];
      return path.startsWith("/profile");
    },
    child: [
      { name: "lb_tab_information", href: "/profile/information" },
      { name: "lb_tab_certificates", href: "/profile/certificates" },
      { name: "lb_tab_services", href: "/profile/services" },
    ],
  },
  {
    itemId: DashboardItem.MORE_SEPARATOR,
    name: MORE_SEPARATOR_NAME,
    href: "/more",
    icon: FiMoreHorizontal,
  },
  {
    itemId: DashboardItem.SETTINGS,
    name: "settings",
    href: "/settings/my-account/profile",
    icon: FiSettings,
  },
  {
    itemId: DashboardItem.DISCOVER,
    name: "lb_discover",
    href: "/search",
    icon: FiCompass,
  },
  {
    itemId: DashboardItem.COACHES,
    name: "lb_coaches",
    href: "/coaches",
    badge: <UnreadMessagesBadge />,
    icon: FiUsers,
  },
];

const findNavigationItem = (itemId: DashboardItem) => {
  for (const navigationItem of navigation) {
    if (navigationItem.itemId === itemId) {
      return navigationItem;
    }
  }
  // Which should never happen
  return {} as NavigationItemType;
};

const coachDashboardItems: NavigationItemType[] = [
  DashboardItem.DASHBOARD,
  DashboardItem.BOOKINGS,
  DashboardItem.CLIENTS,
  DashboardItem.PROFILE,
  DashboardItem.MORE_SEPARATOR,
  DashboardItem.SETTINGS,
].map(findNavigationItem);

const clientDashboardItems: NavigationItemType[] = [
  DashboardItem.DISCOVER,
  DashboardItem.BOOKINGS,
  DashboardItem.COACHES,
  DashboardItem.MORE_SEPARATOR,
  DashboardItem.SETTINGS,
].map(findNavigationItem);

const getNavigationItems = (userType: UserType = UserType.COACH) => {
  const moreSeparatorIndex = navigation.findIndex((item) => item.name === MORE_SEPARATOR_NAME);
  // We create all needed navigation items for the different use cases
  const currentNavigationItems = userType === UserType.COACH ? coachDashboardItems : clientDashboardItems;
  return currentNavigationItems.reduce<Record<string, NavigationItemType[]>>(
    (items, item, index) => {
      // We filter out the "more" separator in` desktop navigation
      if (item.name !== MORE_SEPARATOR_NAME) items.desktopNavigationItems.push(item);
      // Items for mobile bottom navigation
      if (index < moreSeparatorIndex + 1 && !item.onlyDesktop) items.mobileNavigationBottomItems.push(item);
      // Items for the "more" menu in mobile navigation
      else items.mobileNavigationMoreItems.push(item);
      return items;
    },
    { desktopNavigationItems: [], mobileNavigationBottomItems: [], mobileNavigationMoreItems: [] }
  );
};

const Navigation = () => {
  const query = useMeQuery();
  const user = query.data;

  const { desktopNavigationItems } = getNavigationItems(user?.userType);

  return (
    <nav className="mt-2 flex-1 md:px-2 lg:mt-6 lg:px-0">
      {desktopNavigationItems.map((item) => (
        <NavigationItem key={item.name} item={item} />
      ))}
      <div className="mt-0.5 text-gray-500 lg:hidden">{/* <KBarTrigger /> */}</div>
    </nav>
  );
};

function useShouldDisplayNavigationItem(item: NavigationItemType) {
  const { status } = useSession();
  const { data: routingForms } = trpc.viewer.appById.useQuery(
    { appId: "routing-forms" },
    {
      enabled: status === "authenticated" && requiredCredentialNavigationItems.includes(item.name),
      trpc: {},
    }
  );
  return !requiredCredentialNavigationItems.includes(item.name) || routingForms?.isInstalled;
}

const defaultIsCurrent: NavigationItemType["isCurrent"] = ({ isChild, item, router }) => {
  return isChild ? item.href === router.asPath : router.asPath.startsWith(item.href);
};

const NavigationItem: React.FC<{
  index?: number;
  item: NavigationItemType;
  isChild?: boolean;
}> = (props) => {
  const { item, isChild } = props;
  const { t, isLocaleReady } = useLocale();
  const router = useRouter();
  const isCurrent: NavigationItemType["isCurrent"] = item.isCurrent || defaultIsCurrent;
  const current = isCurrent({ isChild: !!isChild, item, router });
  const shouldDisplayNavigationItem = useShouldDisplayNavigationItem(props.item);

  if (!shouldDisplayNavigationItem) return null;

  return (
    <Fragment>
      <Link
        href={item.href}
        aria-label={t(item.name)}
        className={classNames(
          "group flex items-center rounded-md py-2 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 [&[aria-current='page']]:bg-gray-100 [&[aria-current='page']]:hover:text-gray-900",
          isChild
            ? `[&[aria-current='page']]:text-brand-900 mt-px hidden h-8 pl-16 lg:flex lg:pl-11`
            : "[&[aria-current='page']]:text-brand-900 mt-0.5 text-sm"
        )}
        aria-current={current ? "page" : undefined}>
        {item.icon && (
          <item.icon
            className="h-4 w-4 flex-shrink-0 text-gray-500 ltr:mr-2 rtl:ml-2 [&[aria-current='page']]:text-inherit"
            aria-hidden="true"
            aria-current={current ? "page" : undefined}
          />
        )}
        {isLocaleReady ? (
          <span className="hidden w-full justify-between lg:flex">
            <div className="flex">{t(item.name)}</div>
            {item.badge && item.badge}
          </span>
        ) : (
          <SkeletonText className="h-3 w-32" />
        )}
      </Link>
      {item.child &&
        isCurrent({ router, isChild, item }) &&
        item.child.map((item, index) => <NavigationItem index={index} key={item.name} item={item} isChild />)}
    </Fragment>
  );
};

function MobileNavigationContainer() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <MobileNavigation />;
}

const MobileNavigation = () => {
  const isEmbed = useIsEmbed();
  const query = useMeQuery();
  const user = query.data;

  const { mobileNavigationBottomItems } = getNavigationItems(user?.userType);

  return (
    <>
      <nav
        className={classNames(
          "bottom-nav fixed bottom-0 z-30 -mx-4 flex w-full border border-t border-gray-200 bg-gray-50 bg-opacity-40 px-1 shadow backdrop-blur-md md:hidden",
          isEmbed && "hidden"
        )}>
        {mobileNavigationBottomItems.map((item) => (
          <MobileNavigationItem key={item.name} item={item} />
        ))}
      </nav>
      {/* add padding to content for mobile navigation*/}
      <div className="block pt-12 md:hidden" />
    </>
  );
};

const MobileNavigationItem: React.FC<{
  item: NavigationItemType;
  isChild?: boolean;
}> = (props) => {
  const { item, isChild } = props;
  const router = useRouter();
  const { t, isLocaleReady } = useLocale();
  const isCurrent: NavigationItemType["isCurrent"] = item.isCurrent || defaultIsCurrent;
  const current = isCurrent({ isChild: !!isChild, item, router });
  const shouldDisplayNavigationItem = useShouldDisplayNavigationItem(props.item);

  if (!shouldDisplayNavigationItem) return null;
  return (
    <Link
      key={item.name}
      href={item.href}
      className="relative my-2 min-w-0 flex-1 overflow-hidden rounded-md py-2 px-1 text-center text-xs font-medium text-gray-400 hover:bg-gray-200 hover:text-gray-700 focus:z-10 sm:text-sm [&[aria-current='page']]:text-gray-900"
      aria-current={current ? "page" : undefined}>
      {item.badge && <div className="absolute right-1 top-1">{item.badge}</div>}
      {item.icon && (
        <item.icon
          className="mx-auto mb-1 block h-5 w-5 flex-shrink-0 text-center text-inherit [&[aria-current='page']]:text-gray-900"
          aria-hidden="true"
          aria-current={current ? "page" : undefined}
        />
      )}
      {isLocaleReady ? <span className="block truncate">{t(item.name)}</span> : <SkeletonText />}
    </Link>
  );
};

const MobileNavigationMoreItem: React.FC<{
  item: NavigationItemType;
  isChild?: boolean;
}> = (props) => {
  const { item } = props;
  const { t, isLocaleReady } = useLocale();
  const shouldDisplayNavigationItem = useShouldDisplayNavigationItem(props.item);

  if (!shouldDisplayNavigationItem) return null;

  return (
    <li className="border-b last:border-b-0" key={item.name}>
      <Link href={item.href} className="flex items-center justify-between p-5 hover:bg-gray-100">
        <span className="flex items-center font-semibold text-gray-700 ">
          {item.icon && <item.icon className="h-5 w-5 flex-shrink-0 ltr:mr-3 rtl:ml-3" aria-hidden="true" />}
          {isLocaleReady ? t(item.name) : <SkeletonText />}
        </span>
        <FiArrowRight className="h-5 w-5 text-gray-500" />
      </Link>
    </li>
  );
};

function SideBarContainer() {
  const { status } = useSession();
  const router = useRouter();

  // Make sure that Sidebar is rendered optimistically so that a refresh of pages when logged in have SideBar from the beginning.
  // This improves the experience of refresh on app store pages(when logged in) which are SSG.
  // Though when logged out, app store pages would temporarily show SideBar until session status is confirmed.
  if (status !== "loading" && status !== "authenticated") return null;
  if (router.route.startsWith("/v2/settings/")) return null;
  return <SideBar />;
}

function SideBar() {
  return (
    <div className="relative">
      <aside className="desktop-transparent top-0 hidden h-full max-h-screen w-14 flex-col overflow-y-auto overflow-x-hidden border-r border-neutral-200 bg-white md:sticky md:flex lg:w-56 lg:px-4">
        <div className="flex h-full flex-col justify-between py-3 lg:pt-6 ">
          <header className="items-center justify-between md:hidden lg:flex">
            <Link href="/" className="px-2">
              <Logo small />
            </Link>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button
                color="minimal"
                onClick={() => window.history.back()}
                className="desktop-only group flex text-sm font-medium text-gray-500 hover:text-gray-900">
                <FiArrowLeft className="h-4 w-4 flex-shrink-0 text-gray-500 group-hover:text-gray-900" />
              </button>
              <button
                color="minimal"
                onClick={() => window.history.forward()}
                className="desktop-only group flex text-sm font-medium text-gray-500 hover:text-gray-900">
                <FiArrowRight className="h-4 w-4 flex-shrink-0 text-gray-500 group-hover:text-gray-900" />
              </button>
              {/* <KBarTrigger /> */}
            </div>
          </header>

          <hr className="desktop-only absolute -left-3 -right-3 mt-4 block w-full border-gray-200" />

          {/* logo icon for tablet */}
          <Link href="/" className="text-center md:inline lg:hidden">
            <Logo small icon />
          </Link>

          <Navigation />
        </div>

        <div>
          {/* <Tips /> */}
          <div data-testid="user-dropdown-trigger">
            <span className="hidden lg:inline">
              <UserDropdown />
            </span>
            <span className="hidden md:inline lg:hidden">
              <UserDropdown small />
            </span>
          </div>
          <Credits />
        </div>
      </aside>
    </div>
  );
}

export function ShellMain(props: LayoutProps) {
  const router = useRouter();
  const { isLocaleReady } = useLocale();

  return (
    <>
      <div className={classNames("mb-4 flex sm:mt-0 md:mb-6", props.smallHeading ? "lg:mb-7" : "lg:mb-8")}>
        {!!props.backPath && (
          <Button
            variant="icon"
            size="sm"
            color="minimal"
            onClick={() =>
              typeof props.backPath === "string" ? router.push(props.backPath as string) : router.back()
            }
            StartIcon={FiArrowLeft}
            aria-label="Go Back"
            className="mt-2 rounded-md ltr:mr-2 rtl:ml-2"
          />
        )}
        {props.heading && (
          <header className={classNames(props.large && "py-8", "flex w-full max-w-full items-center")}>
            {props.HeadingLeftIcon && <div className="ltr:mr-4">{props.HeadingLeftIcon}</div>}
            <div className={classNames("w-full ltr:mr-4 rtl:ml-4 md:block", props.headerClassName)}>
              {props.heading && (
                <h3
                  className={classNames(
                    "font-cal max-w-28 sm:max-w-72 md:max-w-80 hidden truncate text-xl font-semibold tracking-wide text-black md:block xl:max-w-full",
                    props.smallHeading ? "text-base" : "text-xl"
                  )}>
                  {!isLocaleReady ? <SkeletonText invisible /> : props.heading}
                </h3>
              )}
              {props.subtitle && (
                <p className="hidden text-sm text-gray-500 md:block">
                  {!isLocaleReady ? <SkeletonText invisible /> : props.subtitle}
                </p>
              )}
            </div>
            {props.CTA && (
              <div
                className={classNames(
                  props.backPath
                    ? "relative"
                    : "fixed bottom-[88px] z-40 ltr:right-4 rtl:left-4 md:z-auto md:ltr:right-0 md:rtl:left-0",
                  "flex-shrink-0 md:relative md:bottom-auto md:right-auto"
                )}>
                {props.CTA}
              </div>
            )}
            {props.actions && props.actions}
          </header>
        )}
      </div>
      <div className={classNames(props.flexChildrenContainer && "flex flex-1 flex-col")}>
        {props.children}
      </div>
    </>
  );
}

function MainContainer({
  MobileNavigationContainer: MobileNavigationContainerProp = <MobileNavigationContainer />,
  TopNavContainer: TopNavContainerProp = <TopNavContainer />,
  ...props
}: LayoutProps) {
  return (
    <main className="relative z-0 flex-1 bg-gray-50 focus:outline-none">
      {/* show top navigation for md and smaller (tablet and phones) */}
      {TopNavContainerProp}
      <div className="max-w-full px-4 py-4 md:py-8 lg:px-12">
        <ErrorBoundary>
          {!props.withoutMain ? <ShellMain {...props}>{props.children}</ShellMain> : props.children}
        </ErrorBoundary>
        {/* show bottom navigation for md and smaller (tablet and phones) on pages where back button doesn't exist */}
        {!props.backPath ? MobileNavigationContainerProp : null}
      </div>
    </main>
  );
}

function TopNavContainer() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <TopNav />;
}

function TopNav() {
  const isEmbed = useIsEmbed();
  const { t } = useLocale();
  return (
    <>
      <nav
        style={isEmbed ? { display: "none" } : {}}
        className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 bg-opacity-50 py-1.5 px-4 backdrop-blur-lg sm:p-4 md:hidden">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 self-center">
          <span className="group flex items-center rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 lg:hidden">
            {/* <KBarTrigger /> */}
          </span>
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            <span className="sr-only">{t("settings")}</span>
            <Link href="/settings/my-account/profile">
              <FiSettings className="h-4 w-4 text-gray-700" aria-hidden="true" />
            </Link>
          </button>
          <UserDropdown small />
        </div>
      </nav>
    </>
  );
}

export const MobileNavigationMoreItems = () => {
  const query = useMeQuery();
  const user = query.data;

  const { mobileNavigationMoreItems } = getNavigationItems(user?.userType);

  return (
    <ul className="mt-2 rounded-md border">
      {mobileNavigationMoreItems.map((item) => (
        <MobileNavigationMoreItem key={item.name} item={item} />
      ))}
    </ul>
  );
};
