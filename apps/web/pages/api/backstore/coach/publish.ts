import { Prisma, ReviewStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";

import { HttpError } from "@calcom/lib/http-error";
import prisma from "@calcom/prisma";

const requestValidation = z.object({
  body: z.object({
    coachUserId: z.number(),
  }),
  headers: z.object({
    authorization: z.string(),
  }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { body, headers } = requestValidation.parse(req);
    if (process.env.RETOOL_AUTH_KEY !== headers.authorization) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ message: "Invalid method" });
      return;
    }

    const draftProfile = await prisma.user
      .findUnique({
        where: { id: body.coachUserId },
      })
      .coachProfileDraft({
        include: {
          specializations: true,
          certificates: true,
        },
      });

    // Draft profile is guaranteed to exist for coaches in business logic
    if (!draftProfile) {
      throw new HttpError({
        statusCode: 404,
        message: "User not found",
      });
    }

    if (draftProfile.reviewStatus !== ReviewStatus.REVIEW_STARTED) {
      throw new HttpError({
        statusCode: 400,
        message: "Bad state: Profile is not in review started status",
      });
    }

    // Publishing the profile:
    // 1. Upsert the coach profile with the draft profile data
    // 2. Set the review status to published on the published profile
    // 3. Set relational data on the published profile
    //    - Specializations
    //    - Certificates
    // 4. Reset the review status on the draft profile

    const {
      // metadata
      /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars */
      id,
      reviewStatus,
      requestedReviewAt,
      reviewedAt,
      rejectionReason,
      /* eslint-enable */
      // relational data
      specializations,
      certificates,
      // profile data
      ...profileInformation
    } = draftProfile;

    const publishedProfileData: Prisma.CoachCreateInput = {
      ...profileInformation,
      reviewStatus: ReviewStatus.PUBLISHED,
      requestedReviewAt: null,
      reviewedAt: new Date(),
      rejectionReason: null,
    };

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: body.coachUserId },
        data: {
          coachProfile: {
            upsert: {
              create: publishedProfileData,
              update: publishedProfileData,
            },
          },
        },
      });

      const publishedProfileId = user.coachProfileId;
      if (!publishedProfileId) throw new Error("Bad state: Coach profile id is null");

      // Publish specializations
      await tx.coach.update({
        where: { id: publishedProfileId },
        data: {
          specializations: {
            set: specializations?.map(({ id }) => ({ id })) ?? [],
          },
        },
      });

      // Publish certificates
      // Note: first, we delete all certificates and then recreate them
      // This is because we don't have a way to update certificates
      await tx.certificate.deleteMany({
        where: { coachId: publishedProfileId },
      });
      await tx.certificate.createMany({
        data:
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
          certificates?.map(({ id, coachId, ...data }) => ({
            ...data,
            coachId: publishedProfileId,
          })) ?? [],
      });

      // Reset draft profile
      await tx.coach.update({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        where: { id: user.coachProfileDraftId! },
        data: {
          reviewStatus: ReviewStatus.DRAFT,
          requestedReviewAt: null,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });
    });

    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(406).json({
        error: "User id for coach and auth key needs to be provided",
      });
      return;
    }

    if (err instanceof HttpError) {
      res.status(err.statusCode).json({
        error: err.message,
      });
      return;
    }

    throw err;
  }
}
