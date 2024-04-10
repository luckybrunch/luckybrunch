import { UserType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next/types";

import hubspotClient from "@calcom/lib/hubspot";
import prisma from "@calcom/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers.authorization || req.query.apiKey;

  if (process.env.CRON_API_KEY !== apiKey) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  console.log("Syncing coaches with hubspot...");

  const users = await prisma.user.findMany({
    where: { userType: UserType.COACH },
    select: {
      email: true,
      username: true,
      coachProfileDraft: {
        select: {
          bio: true,
          companyName: true,
          city: true,
          addressLine1: true,
          addressLine2: true,
          appointmentTypes: true,
          firstName: true,
          lastName: true,
          zip: true,
          specializations: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} coaches`);

  await hubspotClient.updateOrCreateUsers(
    users.map((user) => {
      return {
        ...user,
        contactGroup: "coach",
      };
    })
  );

  console.log("Done.");
  res.json({ ok: true });
}
