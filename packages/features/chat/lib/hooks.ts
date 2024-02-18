import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";
import { StreamChat, Event as StreamEvent } from "stream-chat";

import { trpc } from "@calcom/trpc";

function useChatIdentity() {
  return trpc.viewer.chat.chatIdentity.useQuery().data;
}

export function useChatClient() {
  const data = useChatIdentity();
  const { data: client } = useQuery({
    enabled: !!data,
    queryKey: ["stream-chat"],
    queryFn: async () => {
      if (!data) {
        throw new Error("Chat token not available");
      }
      const client = StreamChat.getInstance(data.apiKey);
      if (client.userID && client.userID !== data.user.id) {
        await client.disconnectUser();
      }
      if (!client.userID) {
        await client.connectUser(data.user, data.token);
      }
      return client;
    },
  });

  return client;
}

export function useChatTotalUnreadCount() {
  const client = useChatClient();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!client) {
      return;
    }
    setCount((client.user?.total_unread_count ?? 0) as number);
    const handle = (e: StreamEvent) => {
      if (e.total_unread_count) {
        setCount(e.total_unread_count);
      }
    };
    client.on("notification.message_new", handle);
    client.on("notification.mark_read", handle);
    return () => {
      client.off("notification.message_new", handle);
      client.off("notification.mark_read", handle);
    };
  }, [client]);

  return count;
}

export function useChannel(otherPartyId: string) {
  const client = useChatClient();
  const { data: otherParty } = trpc.viewer.chat.connectOtherParty.useQuery({ otherPartyId });
  return useMemo(() => {
    return otherParty && client?.user
      ? client.channel("coach_customer", {
          members: [client.user.id, otherParty.id],
        })
      : undefined;
  }, [otherParty, client]);
}

export function useChannelUnreadCount(otherPartyId: string) {
  const channel = useChannel(otherPartyId);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!channel) {
      return;
    }
    channel.watch().then(() => {
      setCount(channel.countUnread());
    });
    const handle = () => {
      setCount(channel.countUnread());
    };
    channel.on("message.new", handle);
    channel.on("message.read", handle);
    return () => {
      channel.off("message.new", handle);
      channel.off("message.read", handle);
    };
  }, [channel]);

  return count;
}
