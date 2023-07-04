import { DesktopComputerIcon } from "@heroicons/react/outline";
import { GetServerSidePropsContext } from "next/types";
import { useState } from "react";

import { useCoachFilterQuery } from "@calcom/features/coaches/lib/useCoachFilterQuery";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, List, ListItem, SkeletonLoader, showToast } from "@calcom/ui";

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
              <List className="flex w-full flex-row flex-wrap justify-center">
                {list.map(({ id, avatar, coachProfile }) => {
                  return (
                    <ListItem
                      rounded={false}
                      className="flex min-w-[33%] max-w-[50%] flex-col border-0 md:border-0"
                      key={id}>
                      <div className="flex flex-col items-center pb-10">
                        <img
                          className="mb-3 h-24 w-24 rounded-full text-center shadow-lg"
                          src={avatar ?? ""}
                          alt={`${coachProfile?.firstName ?? ""} ${coachProfile?.lastName ?? ""}`}
                        />
                        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                          {`${coachProfile?.firstName ?? ""} ${coachProfile?.lastName ?? ""}`}
                        </h5>

                        <span className="text-sm text-gray-500 dark:text-gray-400">{coachProfile?.bio}</span>
                        <ul className="mt-4 flex flex-wrap content-center md:mt-6">
                          {coachProfile?.specializations.map(({ id, label }) => {
                            return (
                              <li
                                key={id}
                                className="m-1 w-full max-w-sm rounded-lg border border-gray-200 bg-white p-1 shadow dark:border-gray-700 dark:bg-gray-800">
                                {label}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </ListItem>
                  );
                })}
              </List>
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
