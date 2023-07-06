import { DesktopComputerIcon } from "@heroicons/react/outline";
import { Rating } from "@smastrom/react-rating";
import { GetServerSidePropsContext } from "next/types";
import { useState } from "react";

import { useCoachFilterQuery } from "@calcom/features/coaches/lib/useCoachFilterQuery";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, SkeletonLoader, showToast } from "@calcom/ui";
import { FiEye } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

import { ssrInit } from "@server/lib/ssr";

export default function Search() {
  const { data: queryFilters } = useCoachFilterQuery();
  const [isWarningShown, setWarningShown] = useState(false);
  const WithQuery = withQuery(
    trpc.viewer.coaches.search,
    {
      filters: queryFilters,
    },
    {
      cacheTime: 0,
      onSuccess: ({ matched }) => {
        if (!matched && !isWarningShown) {
          showToast(
            "We couldn't find coaches for your exact criterias but here are some of them who might be able to help.",
            "warning",
            /* 4 seconds duration */ 4000
          );
          setWarningShown(true);
        }
      },
    }
  );

  const { t } = useLocale();

  return (
    <Shell isPublic heading={t("lb_search_coach")} subtitle={t("lb_search_coach_subtitle")}>
      <WithQuery
        customLoader={<SkeletonLoader />}
        success={({ data: { list } }) => {
          if (list.length > 0) {
            return (
              <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {list.map(({ id, username, avatar, coachProfile }) => (
                  <li key={id} className="col-span-1 flex flex-col rounded-lg bg-white text-center shadow">
                    <div className="flex flex-1 flex-col gap-1 p-6">
                      <img
                        className="max-w-48 aspect-square w-full self-center rounded-lg object-cover"
                        src={avatar ?? ""}
                        alt=""
                      />
                      <h3 className="text-m mt-4 font-medium text-gray-900">
                        {coachProfile?.firstName ?? ""} {coachProfile?.lastName ?? ""}
                      </h3>
                      <p className="text-sm text-gray-500">{coachProfile?.bio}</p>
                      <div className="mt-2 flex items-center justify-center">
                        <Rating style={{ maxWidth: 180 }} value={3} readOnly />
                      </div>
                    </div>
                    <div>
                      <div className="flex border-t border-gray-200">
                        <div className="flex w-0 flex-1">
                          <a
                            href={`/${username}`}
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
            );
          }

          return (
            <EmptyScreen
              Icon={DesktopComputerIcon}
              headline={t("lb_search_coach_empty_title")}
              description={t("lb_search_coach_empty_subtitle")}
            />
          );
        }}
      />
    </Shell>
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
