import Link from "next/link";

import { generateChannelName } from "@calcom/features/chat/lib/generateChannelName";
import Shell from "@calcom/features/shell/Shell";
import { trpc } from "@calcom/trpc";
import { List, ListItem, Badge } from "@calcom/ui";

import { withQuery } from "@lib/QueryCell";
import useMeQuery from "@lib/hooks/useMeQuery";

export default function Coaches() {
  const WithQuery = withQuery(trpc.viewer.clients.myCoaches);
  const { data: user } = useMeQuery();
  const { data: unreadCounts } = trpc.viewer.chat.unreadCounts.useQuery(undefined, {
    enabled: !!user?.email,
  });

  return (
    <Shell heading="My coaches" title="Coaches" subtitle="Chat with your coaches">
      <WithQuery
        success={({ data: coaches }) => {
          return (
            <List>
              {coaches.map((coach, index) => {
                const chatId = generateChannelName({
                  coachId: coach?.id,
                  clientEmail: user?.email,
                });

                return (
                  <ListItem key={coach?.id || index}>
                    <Link
                      href={`/clients/${user?.email}/chat?coachId=${coach?.id}`}
                      className="h-full w-full">
                      <p>{coach?.coachProfile?.name}</p>
                      {(unreadCounts?.unreadChannels[chatId] ?? 0) > 0 && (
                        <Badge className="absolute" variant="green">
                          {unreadCounts?.unreadChannels[chatId]}
                        </Badge>
                      )}
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
