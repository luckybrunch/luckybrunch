import { UserType } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { StreamChat, DefaultGenerics } from "stream-chat";
import { z } from "zod";

import { normalizeIdForChat } from "@calcom/features/chat/lib/generateChannelName";

import { authedProcedure, router } from "../../trpc";

const CUSTOM_SERVICE_COMMAND = "services";

const getToken = (normalizedId: string) =>
  sign({ user_id: normalizedId }, process.env.CHAT_TOKEN_SECRET || "");

const getChatClient = (() => {
  let chatClient: StreamChat<DefaultGenerics> | null = null;

  return async () => {
    if (chatClient != null) {
      return chatClient;
    }

    chatClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_CHAT_API_KEY || "",
      process.env.CHAT_SECRET || ""
    );

    try {
      await chatClient.updateAppSettings({
        custom_action_handler_url: process.env.CHAT_WEBHOOK_URL,
      });

      const commandsListRes = await chatClient.listCommands();

      if (commandsListRes.commands.findIndex((command) => command.name === CUSTOM_SERVICE_COMMAND) === -1) {
        await chatClient.createCommand({
          description: "Let coaches offer services through chat",
          name: CUSTOM_SERVICE_COMMAND,
        });
      }

      const channelTypesRes = await chatClient.listChannelTypes();
      const fitChannel = channelTypesRes.channel_types["fit-channel"];

      if (!fitChannel) {
        await chatClient.createChannelType({
          name: "fit-channel",
          commands: [CUSTOM_SERVICE_COMMAND],
          uploads: true,
          read_events: true,
          typing_events: true,
          quotes: true,
          replies: true,
        });
      }

      console.log("Chat client set up");
    } catch (e) {
      console.log("An error was occurred setting up chat client", e);
    }

    return chatClient;
  };
})();

export const chatRouter = router({
  connectOtherParty: authedProcedure
    .input(z.object({ otherPartyId: z.string() }))
    .query(async ({ input }) => {
      const normalizedId = normalizeIdForChat(input.otherPartyId);
      const chatClient = await getChatClient();
      const queryResponse = await chatClient.queryUsers({ id: normalizedId });

      if (queryResponse.users.length > 0) {
        return true;
      }

      const token = getToken(normalizedId);
      const connectionResponse = await chatClient.connectUser({ id: normalizedId }, token);

      await chatClient.disconnectUser();

      return Boolean(connectionResponse?.connection_id);
    }),
  unreadCounts: authedProcedure.query(async ({ ctx }) => {
    const userChatId = ctx.user.userType === UserType.COACH ? ctx.user.id.toString() : ctx.user.email;
    const normalizedId = normalizeIdForChat(userChatId);

    const token = getToken(normalizedId);
    const chatClient = await getChatClient();
    const connection = await chatClient.connectUser({ id: normalizedId }, token);

    if (!connection || !connection.me) {
      return {
        total: 0,
        unreadChannels: {},
      };
    }

    const channels = await chatClient.queryChannels({
      members: {
        $in: [normalizedId],
      },
    });

    const unreadChannels: Record<string, number> = {};
    let total = 0;

    for (const channel of channels) {
      if (!channel.id) {
        continue;
      }

      const unreadCountPerChannel = channel.countUnread();
      unreadChannels[channel.id] = unreadCountPerChannel;
      total += unreadCountPerChannel;
    }

    await chatClient.disconnectUser();

    return {
      total,
      unreadChannels,
    };
  }),
  getCredentials: authedProcedure.input(z.object({ userChatId: z.string() })).query(({ input }) => {
    const { userChatId } = input;
    const token = getToken(userChatId);

    return {
      token,
    };
  }),
});
