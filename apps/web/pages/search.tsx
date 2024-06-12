import MarkdownIt from "markdown-it";
import { GetServerSidePropsContext } from "next/types";

import { AppointmentType } from "@calcom/features/coaches/types";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Loader, Rating } from "@calcom/ui";
import { FiEye, FiSearch } from "@calcom/ui/components/icon";

import { useQueryState } from "@components/getting-started/query-state";
import { MultiSelectFilter } from "@components/ui/form/MultiSelectFilter";

import { ssrInit } from "@server/lib/ssr";

const md = new MarkdownIt("default", { html: true, breaks: true, linkify: true });

export default function Search() {
  const { t } = useLocale();

  const { data: specializations } = trpc.public.getSpecializations.useQuery();
  const meetingOptions = [
    { label: t("lb_appointmenttype_online"), value: AppointmentType.ONLINE },
    { label: t("lb_appointmenttype_home"), value: AppointmentType.HOME },
    { label: t("lb_appointmenttype_office"), value: AppointmentType.OFFICE },
  ];

  const [goals, setGoals] = useQueryState("goals");
  const [selectedMeetingOptions, setMeetingOptions] = useQueryState("meetingOptions");

  const { data } = trpc.viewer.coaches.search.useQuery(
    {
      filters: { goals, meetingOptions: selectedMeetingOptions },
    },
    {
      keepPreviousData: true,
    }
  );

  return (
    <Shell isPublic heading={t("lb_search_coach")} subtitle={t("lb_search_coach_subtitle")}>
      {specializations ? (
        <div className="mb-6 flex flex-row gap-1.5">
          <MultiSelectFilter
            label={t("lb_specializations")}
            options={specializations.map(({ id, label }) => ({ value: id.toString(), label: label }))}
            value={goals ?? []}
            onValueChange={(v) => setGoals(v)}
          />
          <MultiSelectFilter
            label={t("lb_appointmenttypes_label")}
            options={meetingOptions}
            value={selectedMeetingOptions ?? []}
            onValueChange={(v) => setMeetingOptions(v)}
          />
        </div>
      ) : null}

      {!data ? <Loader /> : null}

      {!data || data.hasMatches ? null : (
        <div className="mb-6 flex w-full flex-col items-center space-y-3 rounded-md border border-dashed p-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <div className="bg-brand-100 flex h-12 w-12 shrink-0 items-center justify-center rounded-full dark:bg-white">
            <FiSearch className="text-brand-500 inline-block h-6 w-6 stroke-[1.3px] dark:bg-gray-900 dark:text-gray-600" />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-semibold font-cal text-center dark:text-gray-300">
              {t("lb_search_coach_empty_title")}
            </h2>
            <div className="text-center text-sm font-normal leading-6 text-gray-700 dark:text-gray-300 sm:text-start">
              {t("lb_search_coach_empty_subtitle")}
            </div>
          </div>
        </div>
      )}

      {data && data.results.length > 0 ? (
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {data.results.map(({ uid, username, ...profile }) => (
            <li key={uid} className="col-span-1 flex flex-col rounded-lg bg-white text-center shadow">
              <div className="flex flex-1 flex-col gap-1 p-6">
                <img
                  className="max-w-48 aspect-square w-full self-center rounded-lg object-cover"
                  src={profile.avatar ?? ""}
                  alt=""
                />
                <h3 className="text-m mt-4 font-medium text-gray-900">
                  {profile?.firstName ?? ""} {profile?.lastName ?? ""}
                </h3>
                {profile?.bio ? (
                  <>
                    <div
                      className="dark:text-darkgray-600 text-sm text-gray-500 [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:text-blue-600"
                      dangerouslySetInnerHTML={{ __html: md.render(profile?.bio || "") }}
                    />
                  </>
                ) : null}
                <CoachRating coachUserId={uid} />
              </div>
              <div>
                <div className="flex border-t border-gray-200">
                  <div className="flex w-0 flex-1">
                    <a
                      href={`/coach/${username}`}
                      className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                      <FiEye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      {t("lb_coach_view_profile")}
                    </a>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Shell>
  );
}

function CoachRating({ coachUserId }: { coachUserId: number }) {
  const { data } = trpc.viewer.reviews.getRating.useQuery({ coachUserId });

  if (!data) {
    return <div className="h-5" />;
  }

  return (
    <div className="mx-auto flex items-center">
      <Rating rating={data.rating} size="md" />
      <span className="ml-2 text-sm text-gray-500">
        {data.rating.toFixed(1)} ({data.reviewCount})
      </span>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssr = await ssrInit(context);

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
}
