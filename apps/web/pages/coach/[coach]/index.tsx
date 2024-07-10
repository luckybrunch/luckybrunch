import MarkdownIt from "markdown-it";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { HiCheckCircle, HiLocationMarker, HiAcademicCap } from "react-icons/hi";

import { EventTypeDescriptionLazy as EventTypeDescription } from "@calcom/features/eventtypes/components";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import useTheme from "@calcom/lib/hooks/useTheme";
import { trpc } from "@calcom/trpc/react";
import { HeadSeo, Badge, Button, CoachProfileLayout, CoachProfileCard } from "@calcom/ui";
import { FiArrowRight, FiCalendar } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

import { Reviews } from "@components/coaches/Reviews";

import { ssrInit } from "@server/lib/ssr";

const md = new MarkdownIt("default", { html: true, breaks: true, linkify: true });

export default function CoachProfile() {
  useTheme("light"); // LuckyBrunch is all about light theme
  const { t } = useLocale();
  const router = useRouter();

  const query = { ...router.query };
  delete query.user; // So it doesn't display in the Link (and make tests fail)

  const { data: coach, error } = trpc.viewer.coaches.publicCoachProfile.useQuery(
    router.query.coach as string,
    {
      enabled: !!router.query.coach,
    }
  );

  const ServicesQuery = withQuery(trpc.viewer.coaches.publicCoachServices, router.query.coach as string);

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
        subheader=""
        avatarUrl={coach.coachProfile.avatar}
        button={
          <Button href="#services" color="primary" StartIcon={FiCalendar}>
            {t("lb_make_appointment")}
          </Button>
        }>
        {/* CONTAINER LEFT SIDE */}
        <div className="space-y-6 lg:col-span-2 lg:col-start-1">
          {/*ABOUT*/}
          <CoachProfileCard
            header={t("lb_verified_coach")}
            subheader={t("lb_on_lb_since", { date: coach.createdDate })}
            headerIcon={<HiCheckCircle className="text-brand-500" />}
            sectionTitle={t("about")}>
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
                    {
                      {
                        online: t("lb_appointmenttype_online"),
                        office: t("lb_appointmenttype_office"),
                        home: t("lb_appointmenttype_home"),
                      }[item]
                    }
                  </Badge>
                ))}
              </div>
            </dl>
          </CoachProfileCard>

          {/* SERVICE */}
          <CoachProfileCard
            paddingless
            headerId="services"
            header={t("lb_services_page_title")}
            headerIcon={<HiAcademicCap className="text-brand-500" />}>
            <ServicesQuery
              success={({ data: eventTypes }) => (
                <>
                  {eventTypes.map((type) => (
                    <div
                      key={type.id}
                      className="dark:bg-darkgray-100 dark:hover:bg-darkgray-200 dark:border-darkgray-300 group relative flex flex-row-reverse items-center border-b border-gray-200 bg-white first:rounded-t-md last:rounded-b-md last:border-b-0 hover:bg-gray-50">
                      <div className="pointer-events-none absolute right-4 top-0 bottom-0 flex items-center">
                        <FiArrowRight className="h-4 w-4 text-black opacity-0 transition-opacity group-hover:opacity-100 dark:text-white" />
                      </div>
                      {/* Don't prefetch till the time we drop the amount of javascript in [user][type] page which is impacting score for [user] page */}
                      <Link
                        prefetch={false}
                        href={{
                          pathname: `/${coach.username}/${type.slug}`,
                          query,
                        }}
                        className="block w-full p-5"
                        data-testid="event-type-link">
                        <div className="flex flex-wrap items-center">
                          <h2 className="dark:text-darkgray-700 pr-2 text-sm font-semibold text-gray-700">
                            {type.title}
                          </h2>
                        </div>
                        <EventTypeDescription eventType={type} />
                      </Link>
                    </div>
                  ))}
                </>
              )}
            />
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
