import { UserType } from "@prisma/client";
import { useEffect, useState } from "react";
import { Channel as IChannel, DefaultGenerics } from "stream-chat";
import { Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import { generateChannelName, normalizeIdForChat } from "@calcom/features/chat/lib/generateChannelName";
import { useChatClient } from "@calcom/features/chat/lib/useChatClient";
import { trpc } from "@calcom/trpc";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { SkeletonLoader } from "@calcom/ui";

import "../styles/mml-styles.css";

type ChatViewProps = {
  otherParty?: { id?: number | string; email?: string; name?: string } | null;
  chatCredentials: { token: string };
};

export default function ChatView(props: ChatViewProps) {
  const { otherParty, chatCredentials } = props;
  const { data: currentUser } = useMeQuery();

  const [channel, setChannel] = useState<IChannel<DefaultGenerics>>();

  trpc.viewer.chat.connectOtherParty.useQuery(
    {
      otherPartyId:
        (currentUser?.userType === UserType.COACH ? otherParty?.email : currentUser?.id.toString()) ?? "",
      name: otherParty?.name,
    },
    { enabled: !!otherParty && !channel }
  );

  const currentUserChatId =
    currentUser?.userType === UserType.COACH ? currentUser?.id.toString() : currentUser?.email;

  const client = useChatClient({
    user: {
      id: normalizeIdForChat(currentUserChatId),
      name:
        currentUser?.firstName && currentUser?.lastName
          ? `${currentUser?.firstName} ${currentUser?.lastName}`
          : undefined,
    },
    token: chatCredentials.token,
    apiKey: process.env.NEXT_PUBLIC_CHAT_API_KEY || "",
  });

  useEffect(() => {
    if (!client || channel || !otherParty || !currentUser) {
      return;
    }

    let coachId, clientEmail;
    currentUser.userType === UserType.COACH
      ? ((coachId = currentUser.id), (clientEmail = otherParty.email))
      : ((coachId = otherParty.id), (clientEmail = currentUser.email));

    if (!coachId || !clientEmail) {
      return;
    }

    const coachChannel = client.channel("fit-channel", generateChannelName({ coachId, clientEmail }), {
      members: [normalizeIdForChat(clientEmail), coachId.toString()],
      name: "Chat",
    });

    setChannel(coachChannel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, currentUser]);

  if (!client) {
    return <SkeletonLoader />;
  }

  return (
    <Chat client={client} theme="str-chat__theme-light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList unsafeHTML />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}
