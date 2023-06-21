import { useRouter } from "next/router";

import Chat from "@calcom/features/chat/components/Chat";
import { normalizeIdForChat } from "@calcom/features/chat/lib/generateChannelName";
import Shell from "@calcom/features/shell/Shell";
import { trpc } from "@calcom/trpc";

import useMeQuery from "@lib/hooks/useMeQuery";

export default function ClientChat() {
  const { query } = useRouter();
  const { data: me } = useMeQuery();
  const { data: chatCredentials } = trpc.viewer.chat.getCredentials.useQuery(
    { userChatId: normalizeIdForChat(me?.email) || "" },
    { enabled: !!me }
  );

  return (
    <Shell
      title="Chat"
      heading="Chat with your coach"
      subtitle="Chat with your coach and discuss things in more detail">
      {chatCredentials && (
        <Chat
          chatCredentials={{ token: chatCredentials.token }}
          otherParty={{ id: query.coachId as string }}
        />
      )}
    </Shell>
  );
}
