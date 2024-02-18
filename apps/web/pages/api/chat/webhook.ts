import { NextApiResponse } from "next";
import { NextApiRequest } from "next/types";
import rawBody from "raw-body";

import { HttpError, chatCustomCommandHandler } from "@calcom/features/chat/api/custom-command-handler";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405);
    res.end();
    console.warn(`Method ${req.method} not allowed`);
    return;
  }

  const body = await rawBody(req, {
    encoding: "utf-8",
    limit: "1mb",
    length: req.headers["content-length"],
  });

  const signature = req.headers["x-signature"];
  if (typeof signature !== "string") {
    res.status(400);
    res.end();
    console.warn("Missing signature");
    return;
  }

  try {
    const result = await chatCustomCommandHandler({ body, signature });
    res.status(200);
    res.json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode);
      res.json({ message: err.message });
    } else {
      res.status(500);
      res.end();
      console.error(err);
      return;
    }
  }
}
