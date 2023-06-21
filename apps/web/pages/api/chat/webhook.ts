import { NextApiResponse } from "next";
import { NextApiRequest } from "next/types";

import prisma from "@calcom/prisma";

import { HttpError } from "@lib/core/http/error";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    throw new HttpError({
      statusCode: 405,
      message: "Invalid method",
    });
  }

  const emptyMessage = { type: "regular", text: null };

  const action = req.body.form_data?.action;
  const userId = req.body.user?.id;

  if (!userId) {
    res.json({ message: emptyMessage });

    return;
  }

  const eventTypes = await prisma.user
    .findUnique({
      where: { id: Number(userId) },
      select: {
        eventTypes: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })
    .eventTypes();

  if (!eventTypes) {
    res.json({ message: null });

    return;
  }

  if (action) {
    res.json({
      message: {
        type: "regular",
        text: `<a target="_blank" rel="noopener" href="http://localhost:3000/coach-acc/${action}">Recommended service</a>`,
      },
    });

    return;
  }

  res.json({
    message: {
      type: "ephemeral",
      mml: `
      <mml>
        <text>Select a Service</text>
        <button_list>
          ${eventTypes
            .map((eventType) => {
              return `
            <row>
              <button name="action" value="${eventType.slug}">${eventType.title}</button>
            </row>`;
            })
            .join("\n")}
        </button_list>
      </mml>
    `,
    },
  });
}
