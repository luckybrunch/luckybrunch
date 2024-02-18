import {
  Chat as StreamChat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import { SkeletonLoader } from "@calcom/ui";

import { useChannel, useChatClient } from "../lib/hooks";
import "../styles/mml-styles.css";

type ChatViewProps = {
  otherPartyId: string;
};

export function Chat({ otherPartyId }: ChatViewProps) {
  const client = useChatClient();
  const channel = useChannel(otherPartyId);

  if (!client || !channel) {
    return <SkeletonLoader />;
  }

  return (
    <StreamChat client={client} theme="str-chat__theme-light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </StreamChat>
  );
}
