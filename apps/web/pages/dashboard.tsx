import { ClockIcon, DesktopComputerIcon } from "@heroicons/react/outline";
import { ReviewStatus } from "@prisma/client";
import React, { useMemo } from "react";

import { withProfileDiffList } from "@calcom/features/coaches/lib/withProfileDiff";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  Divider,
  EmptyScreen,
  List,
  ListItem,
  ListItemText,
  ListItemTitle,
  SkeletonLoader,
} from "@calcom/ui";
import {
  FiCheck,
  FiClock,
  FiExternalLink,
  FiFile,
  FiInfo,
  FiPlus,
  FiUpload,
} from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

function UnpublishedDashboard() {
  const { data } = trpc.viewer.profile.getOnboardingFlags.useQuery();
  const { t } = useLocale();

  type Item = {
    title: string;
    description: string | (() => JSX.Element);
    icon: () => JSX.Element;
    href: string;
    isDone: boolean;
  };
  type Items = readonly [Item[], Item[]];
  const [doneSteps, undoneSteps] = useMemo<Items>(() => {
    if (!data) {
      return [[], []];
    }
    return [
      {
        title: t("lb_complete_your_info"),
        description: () => (
          <ListItemText component="div">
            <p>{`${t("lb_add_following_parameters_for_review")}:`}</p>
            <ul className="ml-5 list-disc">
              <li>{t("lb_name_and_bio")}</li>
              <li>{t("lb_profile_image")}</li>
              <li>{t("lb_specializations")}</li>
            </ul>
          </ListItemText>
        ),
        icon: () => <FiInfo />,
        href: "/profile/information",
        isDone: data.completedProfileInformations,
      },
      {
        title: t("lb_certificate_empty_state_heading"),
        description: t("lb_certificate_empty_state_desc"),
        icon: () => <FiFile />,
        href: "/profile/certificates",
        isDone: data.completedProfileCertificates,
      },
      {
        title: t("lb_add_your_services"),
        description: t("lb_certificate_empty_state_desc"),
        icon: () => <FiClock />,
        href: "/profile/services",
        isDone: data.completedProfileServices,
      },
    ].reduce((acc, item) => (item.isDone ? acc[0].push(item) : acc[1].push(item), acc), [[], []] as Items);
  }, [data]);

  const renderItem = ({ title, description, icon, href, isDone }: Item) => (
    <ListItem rounded={false} className="flex-col border-0 md:border-0" key={title}>
      <div className="flex w-full flex-1 items-center space-x-2 rtl:space-x-reverse lg:p-2">
        <div className="bg-brand-100 text-brand-500 flex h-10 w-10 items-center justify-center rounded-full">
          {icon()}
        </div>
        <div className="flex-grow truncate pl-2">
          <ListItemTitle
            component="h3"
            className="mb-1 space-x-2 truncate text-sm font-medium text-neutral-900">
            {title}
          </ListItemTitle>
          {typeof description === "string" ? (
            <ListItemText component="p">{description}</ListItemText>
          ) : (
            description()
          )}
        </div>
        <div>
          {isDone ? (
            <Button color="secondary" StartIcon={FiCheck} disabled>
              {t("done")}
            </Button>
          ) : (
            <Button color="primary" StartIcon={FiPlus} href={href}>
              {t("add")}
            </Button>
          )}
        </div>
      </div>
    </ListItem>
  );

  return (
    <>
      <Divider />
      <div className="mb-6 mt-6 flex items-center text-sm">
        <div>
          <p className="font-semibold">{t("lb_add_more_information_to_get_clients")}</p>
          <p className="text-gray-600">{`${t("lb_complete_elements_to_submit_for_review")}: `}</p>
        </div>
      </div>
      <div className="w-full bg-white sm:mx-0 xl:mt-0">
        {undoneSteps.length > 0 && <List roundContainer>{undoneSteps.map(renderItem)}</List>}
        {doneSteps.length > 0 && undoneSteps.length > 0 && <Divider className="mt-8 mb-8" />}
        {doneSteps.length > 0 && <List roundContainer>{doneSteps.map(renderItem)}</List>}
      </div>
    </>
  );
}

function InReview() {
  const { t } = useLocale();
  return (
    <EmptyScreen
      Icon={ClockIcon}
      headline={t("lb_profile_in_review_header", {
        category: t("calendar").toLowerCase(),
      })}
      description={t("lb_profile_in_review_subtitle")}
      buttonRaw={
        <Button color="primary" href="#" StartIcon={FiUpload}>
          {t("lb_remove_from_review")}
        </Button>
        //check icon insertion on button
      }
    />
  );
}

function Published() {
  const { t } = useLocale();
  return (
    <EmptyScreen
      Icon={DesktopComputerIcon}
      headline={t("lb_profile_published_header", {
        category: t("calendar").toLowerCase(),
      })}
      description={t("lb_profile_published_subtitle")}
      buttonRaw={
        <Button color="primary" href="#" StartIcon={FiExternalLink}>
          {t("view_public_page")}
        </Button>
      }
    />
  );
}

export default function DashboardPage() {
  const WithQuery = withQuery(trpc.viewer.me);
  const { data: profileDiff } = trpc.viewer.coaches.getProfileDiff.useQuery();
  const { t } = useLocale();

  return (
    <Shell heading={t("lb_dashboard")} subtitle={t("lb_manage_settings_for_nutritionist_profile")}>
      <WithQuery
        customLoader={<SkeletonLoader />}
        success={({ data: user }) => {
          if (user?.coachProfile && user.coachProfileDraft?.reviewStatus !== ReviewStatus.REVIEW_STARTED) {
            return withProfileDiffList(Published, profileDiff?.diffList);
          }

          if (user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_STARTED) {
            return withProfileDiffList(InReview, profileDiff?.diffList);
          }

          return withProfileDiffList(UnpublishedDashboard, profileDiff?.diffList);
        }}
      />
    </Shell>
  );
}
