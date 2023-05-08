import Link from "next/link";

import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { SkeletonLoader, List, ListItemTitle, ListItemText, ListItem } from "@calcom/ui";
import { FiLink } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

export default function Clients() {
  const { t } = useLocale();
  const WithQuery = withQuery(trpc.viewer.clients.myClients);

  return (
    <Shell
      heading={t("lb_client_list_title")}
      title={t("lb_client_list_title")}
      subtitle={t("lb_client_list_subtitle")}>
      <WithQuery
        customLoader={<SkeletonLoader />}
        success={({ data: clients }) => {
          return (
            <List className="border-none" role="list">
              {clients.map((client) => {
                return (
                  <ListItem
                    className="border-brand-300 flex content-center justify-between rounded-2xl md:p-10"
                    key={client.email}>
                    <Link
                      className="flex w-full content-center justify-between rounded-2xl"
                      href={`/client-details/information?email=${client.email}`}>
                      <div className="flex flex-row">
                        <img
                          className="mr-2 h-10 w-10 rounded-full"
                          src="https://picsum.photos/200/300"
                          alt={client.name}
                        />
                        <div className="flex flex-col content-start">
                          <ListItemTitle>{client.name}</ListItemTitle>
                          <ListItemText>{client.email}</ListItemText>
                        </div>
                      </div>
                      <div className="border-brand-200 rounded-lg border-2 p-1">
                        <FiLink className="text-brand-500 text-3xl font-bold" />
                      </div>
                    </Link>
                  </ListItem>
                );
              })}
            </List>
          );
        }}
      />
    </Shell>
  );
}
