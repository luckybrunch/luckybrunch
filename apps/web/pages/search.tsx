import { DesktopComputerIcon } from "@heroicons/react/outline";

import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, List, Button, ListItem, SkeletonLoader } from "@calcom/ui";
import { FiLink } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

export default function Search() {
  const WithQuery = withQuery(trpc.viewer.coaches.search);
  const { t } = useLocale();

  return (
    <Shell isPublic heading={t("lb_search_coach")} subtitle={t("lb_search_coach_subtitle")}>
      <WithQuery
        customLoader={<SkeletonLoader />}
        success={({ data }) => {
          if (data.length > 0) {
            return (
              <List className="flex w-full flex-row flex-wrap justify-center">
                {data.map(({ id, avatar, coachProfile }) => {
                  return (
                    <ListItem
                      rounded={false}
                      className="flex min-w-[33%] max-w-[50%] flex-col border-0 md:border-0"
                      key={id}>
                      <div className="flex flex-col items-center pb-10">
                        <img
                          className="mb-3 h-24 w-24 rounded-full text-center shadow-lg"
                          src={avatar ?? ""}
                          alt={coachProfile?.name ?? ""}
                        />
                        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                          {coachProfile?.name}
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
              headline="Checkback later to meet with coaches"
              description="Currently there are no coaches registered"
              buttonRaw={
                <Button color="primary" href="/" StartIcon={FiLink}>
                  {t("lb_go_to_homepage")}
                </Button>
              }
            />
          );
        }}
      />
    </Shell>
  );
}
