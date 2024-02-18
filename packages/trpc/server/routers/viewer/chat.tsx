import { StreamChat } from "stream-chat";
import { z } from "zod";

import { User } from "@calcom/prisma/client";

import { TRPCError } from "@trpc/server";

import { authedProcedure, router } from "../../trpc";

const SLASHCMD_SERVICE = "service";
const CHANNEL_COACH_CUSTOMER = "coach_customer";

async function createChatClient() {
  if (
    !process.env.STREAM_CHAT_API_KEY ||
    !process.env.STREAM_CHAT_SECRET ||
    !process.env.STREAM_CHAT_WEBHOOK_URL
  ) {
    throw new Error("Chat API key and secret are required");
  }
  const client = StreamChat.getInstance(process.env.STREAM_CHAT_API_KEY, process.env.STREAM_CHAT_SECRET);

  // Custom slash command
  const { commands } = await client.listCommands();
  const commandConfig = {
    name: SLASHCMD_SERVICE,
    description: "Sende einen Buchungslink für eine Deiner Terminarten",
    set: "coach_commands_set",
  };
  if (!commands.some((c) => c.name === SLASHCMD_SERVICE)) {
    await client.createCommand(commandConfig);
  } else {
    await client.updateCommand(SLASHCMD_SERVICE, commandConfig);
  }
  // Channel type
  const { channel_types } = await client.listChannelTypes();
  if (!(CHANNEL_COACH_CUSTOMER in channel_types)) {
    await client.createChannelType({
      name: CHANNEL_COACH_CUSTOMER,
      commands: [SLASHCMD_SERVICE],
    });
  }
  // Webhook
  await client.updateAppSettings({
    custom_action_handler_url: `${process.env.STREAM_CHAT_WEBHOOK_URL}/api/chat/webhook?type={type}`,
  });

  return client;
}

let chatClient: Promise<StreamChat> | null = null;
function getChatClient() {
  if (!chatClient) {
    chatClient = createChatClient();
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return chatClient!;
}

function userToStreamUser(user: Pick<User, "id" | "name" | "userType">) {
  return {
    id: `${user.userType === "COACH" ? "coach" : "cus"}_${user.id.toString()}`,
    name: user.name ?? undefined,
  };
}

export const chatRouter = router({
  chatIdentity: authedProcedure.query(async ({ ctx }) => {
    const client = await getChatClient();
    const apiKey = process.env.STREAM_CHAT_API_KEY;
    if (!apiKey) {
      throw new Error("Chat API key is required");
    }
    const user = userToStreamUser(ctx.user);
    const token = client.createToken(user.id);
    return { apiKey, user, token };
  }),

  connectOtherParty: authedProcedure
    .input(
      z.object({
        otherPartyId: z.string().transform((id) => z.coerce.number().int().min(0).parse(id)),
      })
    )
    .query(async ({ input, ctx }) => {
      const client = await getChatClient();

      const otherParty = await ctx.prisma.user.findUnique({
        where: {
          id: input.otherPartyId,
        },
        select: {
          id: true,
          name: true,
          userType: true,
        },
      });

      if (!otherParty) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const data = userToStreamUser(otherParty);
      await client.upsertUser(data);

      return data;
    }),
});
