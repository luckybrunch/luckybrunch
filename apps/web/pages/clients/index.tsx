import Link from "next/link";

import { UnreadMessagesChannelBadge } from "@calcom/features/chat";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { SkeletonLoader, List, ListItemTitle, ListItemText, ListItem, EmptyScreen, Button } from "@calcom/ui";
import { FiFile } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";
import useMeQuery from "@lib/hooks/useMeQuery";

export default function Clients() {
  const { t } = useLocale();
  const WithQuery = withQuery(trpc.viewer.clients.myClients);
  const { data: user } = useMeQuery();

  // const { data: unreadCounts } = trpc.viewer.chat.unreadCounts.useQuery(undefined, { enabled: !!user });

  return (
    <Shell
      heading={t("lb_client_list_title")}
      title={t("lb_client_list_title")}
      subtitle={t("lb_client_list_subtitle")}>
      <WithQuery
        customLoader={<SkeletonLoader />}
        empty={() => (
          <EmptyScreen
            Icon={FiFile}
            headline={t("lb_client_list_empty_title")}
            description={t("lb_client_list_empty_description")}
            buttonRaw={<Button href="/dashboard">{t("lb_client_list_empty_action")}</Button>}
          />
        )}
        success={({ data: clients }) => {
          return (
            <List className="border-none" role="list">
              {clients.map((client) => (
                <ListItem
                  className="border-brand-300 flex content-center justify-between rounded-2xl md:p-10"
                  key={client.email}>
                  <Link
                    className="flex w-full content-center justify-between rounded-2xl"
                    href={`/clients/client-details/information?email=${client.email}`}>
                    <div className="flex flex-row">
                      <div className="flex flex-col content-start">
                        <ListItemTitle>{client.name}</ListItemTitle>
                        <ListItemText>{client.email}</ListItemText>
                      </div>
                    </div>
                    {client.id && <UnreadMessagesChannelBadge otherPartyId={client.id.toString()} />}
                  </Link>
                </ListItem>
              ))}
            </List>
          );
        }}
      />
    </Shell>
  );
}
