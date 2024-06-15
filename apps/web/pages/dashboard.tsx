import { ReviewStatus } from "@prisma/client";
import { UserType } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import React, { useMemo } from "react";
import { HiCheckCircle, HiEye, HiExclamationCircle } from "react-icons/hi";

import { withProfileDiffList } from "@calcom/features/coaches/lib/withProfileDiff";
import Shell from "@calcom/features/shell/Shell";
import { classNames } from "@calcom/lib";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import prisma from "@calcom/prisma";
import { trpc } from "@calcom/trpc/react";
import { Button, List, ListItem, ListItemTitle, SkeletonLoader, TrafficLightBanner } from "@calcom/ui";
import { FiCheck, FiClock, FiEye, FiFile, FiInfo, FiPlus } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

function UnpublishedDashboard() {
  const { data } = trpc.viewer.profile.getOnboardingFlags.useQuery();
  const { data: user } = trpc.viewer.me.useQuery();
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
          <>
            <p className="text-sm text-gray-500">{`${t("lb_add_following_parameters_for_review")}:`}</p>
            <ul className="ml-5 list-disc text-sm text-gray-500">
              <li>{t("lb_name_and_bio")}</li>
              <li>{t("lb_profile_image")}</li>
              <li>{t("lb_specializations")}</li>
            </ul>
          </>
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
        description: t("lb_add_your_services_description"),
        icon: () => <FiClock />,
        href: "/profile/services",
        isDone: data.completedProfileServices,
      },
    ].reduce((acc, item) => (item.isDone ? acc[0].push(item) : acc[1].push(item), acc), [[], []] as Items);
  }, [data]);

  const renderItem = ({ title, description, icon, href, isDone }: Item) => (
    <ListItem
      rounded={false}
      className="flex flex-row flex-wrap items-center gap-4 border-0 md:border-0"
      key={title}>
      <div
        className={classNames(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isDone ? "bg-gray-100 text-gray-400" : "bg-brand-100 text-brand-500"
        )}>
        {icon()}
      </div>
      <div className={classNames("flex flex-col text-sm text-gray-500", isDone ? "opacity-60" : "")}>
        <ListItemTitle component="h3" className={isDone ? "text-gray-500" : "text-neutral-900"}>
          {title}
        </ListItemTitle>
        {typeof description === "string" ? <p>{description}</p> : description()}
      </div>
      <div className="ml-auto shrink-0">
        {isDone ? (
          <Button color="secondary" StartIcon={FiCheck} disabled>
            {t("done")}
          </Button>
        ) : (
          <Button color="secondary" StartIcon={FiPlus} href={href}>
            {t("add")}
          </Button>
        )}
      </div>
    </ListItem>
  );

  return (
    <>
      {user?.coachProfileDraft?.reviewStatus === ReviewStatus.DRAFT &&
      !user?.coachProfileDraft?.rejectionReason ? (
        <TrafficLightBanner
          color="yellow"
          title={t("lb_banner_unpublished_title")}
          text={t("lb_banner_unpublished_text")}
          icon={<HiExclamationCircle className="text-lg" />}
        />
      ) : null}
      {user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_REQUESTED ||
      user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_STARTED ? (
        <TrafficLightBanner
          color="yellow"
          date={user?.coachProfileDraft?.requestedReviewAt}
          title={t("lb_banner_review_title")}
          text={t("lb_banner_review_text")}
          icon={<HiEye className="text-lg" />}
        />
      ) : null}
      {user?.coachProfileDraft?.rejectionReason && (
        <TrafficLightBanner
          color="red"
          date={user?.coachProfileDraft?.requestedReviewAt}
          rejectionReason={user?.coachProfileDraft?.rejectionReason}
          title={t("lb_banner_rejection_title")}
          text={t("lb_banner_rejection_text")}
          icon={<HiExclamationCircle className="text-lg" />}
        />
      )}

      <div className="mb-8 mt-6 flex items-center text-sm">
        <div>
          <p className="font-semibold">{t("lb_required_information")}</p>
          <p className="text-gray-500">{`${t("lb_complete_elements_to_submit_for_review")}`}</p>
        </div>
      </div>
      <div className="mx-4 sm:mx-0">
        {undoneSteps.length > 0 && <List roundContainer>{undoneSteps.map(renderItem)}</List>}
        {doneSteps.length > 0 && undoneSteps.length > 0 && <div className="h-6" />}
        {doneSteps.length > 0 && <List roundContainer>{doneSteps.map(renderItem)}</List>}
      </div>
    </>
  );
}

function InReview() {
  const { t } = useLocale();
  const { data: user } = trpc.viewer.me.useQuery();

  return (
    <>
      <TrafficLightBanner
        color="yellow"
        date={user?.coachProfileDraft?.requestedReviewAt}
        title={t("lb_banner_review_title")}
        text={t("lb_banner_review_text")}
        icon={<HiEye className="text-lg" />}
      />
    </>
  );
}

function Published() {
  const { t } = useLocale();
  const { data: user } = trpc.viewer.me.useQuery();

  return (
    <>
      <TrafficLightBanner
        color="green"
        date={user?.coachProfileDraft?.requestedReviewAt}
        title={t("lb_banner_published_title")}
        text={t("lb_banner_published_text")}
        icon={<HiCheckCircle className="text-lg" />}
        buttonRaw={
          <Button
            color="secondary"
            href={user ? `/coach/${user.username}` : "#"}
            target="_blank"
            rel="noopener"
            StartIcon={FiEye}>
            {t("view_public_page")}
          </Button>
        }
      />
      {user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_REQUESTED ||
      user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_STARTED ? (
        <TrafficLightBanner
          color="yellow"
          date={user?.coachProfileDraft?.requestedReviewAt}
          title={t("lb_banner_review_title")}
          text={t("lb_banner_review_text")}
          icon={<HiEye className="text-lg" />}
        />
      ) : null}
      {user?.coachProfileDraft?.rejectionReason && (
        <TrafficLightBanner
          color="red"
          date={user?.coachProfileDraft?.requestedReviewAt}
          title={t("lb_banner_rejection_title")}
          text={t("lb_banner_rejection_text")}
          icon={<HiExclamationCircle className="text-lg" />}
        />
      )}
    </>
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
          if (user?.coachProfile) {
            user?.coachProfile && user.coachProfileDraft?.reviewStatus !== ReviewStatus.REVIEW_STARTED;
            return withProfileDiffList(Published, profileDiff?.diffList);
          }
          if (
            user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_REQUESTED ||
            user?.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_STARTED
          ) {
            return withProfileDiffList(InReview, profileDiff?.diffList);
          }
          return withProfileDiffList(UnpublishedDashboard, profileDiff?.diffList);
        }}
      />
    </Shell>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  const redirect = { redirect: { permanent: false, destination: "/search" } };

  if (!session) {
    return redirect;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      userType: true,
    },
  });

  if (!user || user.userType !== UserType.COACH) {
    return redirect;
  }

  return { props: {} };
};
