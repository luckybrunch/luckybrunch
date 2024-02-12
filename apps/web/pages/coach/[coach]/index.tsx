import MarkdownIt from "markdown-it";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { HiCheckCircle, HiLocationMarker, HiAcademicCap } from "react-icons/hi";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import useTheme from "@calcom/lib/hooks/useTheme";
import { trpc } from "@calcom/trpc/react";
import { HeadSeo, Badge, Button, CoachProfileLayout, CoachProfileCard } from "@calcom/ui";
import { FiCalendar } from "@calcom/ui/components/icon";

import { Reviews } from "@components/coaches/Reviews";

import { ssrInit } from "@server/lib/ssr";

const md = new MarkdownIt("default", { html: true, breaks: true, linkify: true });

export default function CoachProfile() {
  useTheme("light"); // LuckyBrunch is all about light theme
  const { t } = useLocale();
  const router = useRouter();

  const { data: coach, error } = trpc.viewer.coaches.publicCoachProfile.useQuery(
    router.query.coach as string,
    {
      enabled: !!router.query.coach,
    }
  );

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!coach || !coach.coachProfile) {
    return null;
  }

  const fullName = `${coach.coachProfile.firstName} ${coach.coachProfile.lastName}`;
  const isBioEmpty = !coach.coachProfile.bio || !coach.coachProfile.bio.replace("<p><br></p>", "").length;

  return (
    <>
      <HeadSeo title={fullName} description={coach.coachProfile.bio ?? ""} />

      <CoachProfileLayout
        header={fullName}
        subheader="Health Enthusiast" /* TODO: implement short-bio field */
        avatarUrl={coach.avatar}
        button={
          <Button href={`/${coach.username}`} color="primary" StartIcon={FiCalendar}>
            {t("lb_make_appointment")}
          </Button>
        }>
        {/* CONTAINER LEFT SIDE */}
        <div className="space-y-6 lg:col-span-2 lg:col-start-1">
          {/*ABOUT*/}
          <CoachProfileCard
            header={t("lb_verified_coach")}
            subheader={t("lb_on_lb_since", {
              date: coach.emailVerified?.toDateString(),
            })}
            headerIcon={<HiCheckCircle className="text-brand-500" />}
            sectionTitle="About">
            {!isBioEmpty && (
              <>
                <div
                  className="dark:text-darkgray-600 text-sm text-gray-500 [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: md.render(coach.coachProfile.bio || "") }}
                />
              </>
            )}
          </CoachProfileCard>

          {/*SPECIALIZATION*/}
          <CoachProfileCard
            header={t("lb_specialization")}
            headerIcon={<HiAcademicCap className="text-brand-500" />}>
            {coach.coachProfile.specializations.map((item) => (
              <Badge key={item.id} className="mr-2 mb-2 text-sm text-gray-800" variant="lb_green">
                {item.label}
              </Badge>
            ))}
          </CoachProfileCard>

          {/* LOCATION*/}
          <CoachProfileCard
            header={t("location")}
            headerIcon={<HiLocationMarker className="text-brand-500" />}
            button={
              // <Button color="secondary">
              //   <img alt="" src="/Google_Maps_icon_(2020).svg.png" className="mr-2 h-4" />
              //   Google Maps
              // </Button>
              undefined
            }>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="mb-2 text-sm font-bold text-gray-700">{t("address")}</dt>
                <dd className="text-sm text-gray-800">
                  {coach.coachProfile.addressLine1}, {coach.coachProfile.zip} {coach.coachProfile.city}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="mb-2 text-sm font-bold text-gray-700">{t("lb_meet_coach")}</dt>
                {coach.coachProfile.appointmentTypes?.split(",").map((item) => (
                  <Badge key={item} className="mr-2 mb-2 text-sm text-gray-800" variant="lb_green">
                    {item}
                  </Badge>
                ))}
              </div>
            </dl>
          </CoachProfileCard>
        </div>

        {/* CONTAINER RIGHT SIDE */}
        <div className="lg:col-span-1 lg:col-start-3">
          <Reviews coachUserId={coach.id} />
        </div>
      </CoachProfileLayout>
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const ssr = await ssrInit(context);

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};
