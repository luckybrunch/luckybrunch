import { useEffect, useState } from "react";
import { DefaultGenerics, StreamChat, UserResponse } from "stream-chat";

type ClientParams = {
  user: UserResponse<DefaultGenerics>;
  token: string;
  apiKey: string;
};

export const useChatClient = ({ user, token, apiKey }: ClientParams) => {
  const [chatClient, setChatClient] = useState<StreamChat<DefaultGenerics> | null>(null);

  useEffect(() => {
    if (!user || !user.id || !token || !apiKey) {
      return;
    }

    const client = StreamChat.getInstance(apiKey);
    // prevents application from setting stale client (user changed, for example)
    let didUserConnectInterrupt = false;

    const connectionPromise = client.connectUser(user, token).then(() => {
      if (!didUserConnectInterrupt) setChatClient(client);
    });

    return () => {
      didUserConnectInterrupt = true;
      setChatClient(null);
      // wait for connection to finish before initiating closing sequence
      connectionPromise.then(() => client.disconnectUser());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  return chatClient;
};
