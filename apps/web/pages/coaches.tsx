import Link from "next/link";

import { UnreadMessagesChannelBadge } from "@calcom/features/chat";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import { List, ListItem, EmptyScreen, Button } from "@calcom/ui";
import { FiFile } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

export default function Coaches() {
  const { t } = useLocale();
  const WithQuery = withQuery(trpc.viewer.clients.myCoaches);

  return (
    <Shell heading={t("lb_my_coaches")} title={t("lb_coaches")} subtitle={t("lb_chat_with_your_coaches")}>
      <WithQuery
        empty={() => (
          <EmptyScreen
            Icon={FiFile}
            headline={t("lb_coach_list_empty_title")}
            description={t("lb_coach_list_empty_description")}
            buttonRaw={<Button href="/search">{t("lb_coach_list_empty_action")}</Button>}
          />
        )}
        success={({ data: coaches }) => {
          return (
            <List>
              {coaches.map((coach) => (
                <ListItem key={coach.id}>
                  <Link href={`/chat/${coach.id}`} className="h-full w-full">
                    <p>{`${coach.coachProfile?.firstName} ${coach.coachProfile?.lastName}`}</p>
                    <UnreadMessagesChannelBadge otherPartyId={coach.id.toString()} />
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
