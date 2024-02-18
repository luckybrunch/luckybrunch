import { StreamChat } from "stream-chat";
import { z } from "zod";

import { CAL_URL } from "@calcom/lib/constants";
import prisma from "@calcom/prisma";

export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

const requestSchema = z.object({
  // message: z.object({}),
  user: z.object({
    id: z.string(),
  }),
  form_data: z
    .object({
      eventType: z.string(),
    })
    .optional(),
});

export async function chatCustomCommandHandler(args: { body: string; signature: string }) {
  if (!process.env.STREAM_CHAT_API_KEY || !process.env.STREAM_CHAT_SECRET) {
    throw new Error("Chat API key and secret are required");
  }
  const client = StreamChat.getInstance(process.env.STREAM_CHAT_API_KEY, process.env.STREAM_CHAT_SECRET);
  const valid = client.verifyWebhook(args.body, args.signature);
  if (!valid) {
    throw new HttpError(401, "Invalid signature");
  }

  const body = (() => {
    try {
      const req = requestSchema.safeParse(JSON.parse(args.body));
      if (!req.success) {
        throw new HttpError(400, "Invalid request");
      }
      return req.data;
    } catch (err) {
      throw new HttpError(400, "Invalid JSON");
    }
  })();

  const userId = body.user.id;

  if (!userId.startsWith("coach_")) {
    return errorMessage("Das `/service` Kommando ist nur für Coaches verfügbar.");
  }
  const numericId = Number(userId.replace("coach_", ""));

  const coach = await prisma.user.findUnique({
    where: { id: numericId },
    include: { eventTypes: true },
  });

  if (!coach || coach.eventTypes.length === 0) {
    return errorMessage("Fehler: Keine Dienstleistungen gefunden.");
  }

  const eventType = body.form_data?.eventType;
  if (eventType) {
    return {
      message: {
        type: "regular",
        text: `${CAL_URL}/${coach.username}/${eventType}`,
      },
    };
  } else {
    return {
      message: {
        type: "ephemeral",
        mml: `
          <mml>
            <text>Wähle eine Dienstleistung:</text>
            <button_list>
              ${coach.eventTypes
                .map((eventType) => {
                  return `<button name="eventType" value="${eventType.slug}">${eventType.title}</button>`;
                })
                .join("\n")}
            </button_list>
          </mml>
        `,
      },
    };
  }
}

function errorMessage(message: string) {
  return {
    message: {
      type: "error",
      text: message,
    },
  };
}
