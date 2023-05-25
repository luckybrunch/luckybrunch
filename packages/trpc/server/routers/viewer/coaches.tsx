import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { ReviewStatus } from "@prisma/client";
import { Coach } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import {
  ComparableCoachField,
  FieldDiffMetada,
  getFieldDiffMetadata,
  isEmpty,
} from "@calcom/features/coaches/lib/getDiffMetadata";

import { TRPCError } from "@trpc/server";

import { router, publicProcedure, authedCoachProcedure } from "../../trpc";
import { UserType } from ".prisma/client";

export const coachesRouter = router({
  search: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const coaches = await prisma.user.findMany({
      where: {
        userType: UserType.COACH,
        // If a coach profile that is not a draft exists, then it's a published coach
        coachProfileId: {
          not: null,
        },
      },
      select: {
        id: true,
        avatar: true,
        coachProfile: {
          select: {
            id: true,
            name: true,
            bio: true,
            specializations: {
              select: {
                id: true,
                icon: true,
                label: true,
              },
            },
          },
        },
      },
    });

    return coaches;
  }),
  getSignedUrl: authedCoachProcedure.query(async () => {
    const s3Bucket = process.env.S3_BUCKET || "";
    const s3Endpoint = process.env.S3_ENDPOINT || "";
    const s3Region = process.env.S3_REGION || "";
    const s3Key = process.env.S3_KEY || "";
    const s3Secret = process.env.S3_SECRET || "";
    const maxBytes = 1048576 /* 1MB */ * 2;

    const key = `c/${uuidv4()}`;
    const fileUrl = `https://${s3Bucket}.${s3Endpoint}/${key}`;

    try {
      const s3 = new S3Client({
        endpoint: `https://${s3Endpoint}`,
        region: s3Region,
        credentials: {
          accessKeyId: s3Key,
          secretAccessKey: s3Secret,
        },
      });

      const post = await createPresignedPost(s3, {
        Bucket: s3Bucket,
        Key: key,
        Fields: {
          "Content-Type": "application/pdf",
        },
        Expires: 600, // seconds
        Conditions: [["content-length-range", 0, maxBytes]],
      });

      return {
        post,
        fileUrl,
      };
    } catch (err) {
      throw new TRPCError({
        message: "An error occurred while creating signed url",
        code: "INTERNAL_SERVER_ERROR",
        cause: err,
      });
    }
  }),
  requestReview: authedCoachProcedure.mutation(async ({ ctx }) => {
    const { prisma, user } = ctx;

    if (
      user.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_REQUESTED ||
      user.coachProfileDraft?.reviewStatus === ReviewStatus.REVIEW_STARTED
    ) {
      return;
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        coachProfileDraft: {
          update: {
            reviewStatus: ReviewStatus.REVIEW_REQUESTED,
            requestedReviewAt: new Date(),
          },
        },
      },
    });
  }),
  getProfileDiff: authedCoachProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    const pp = prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .coachProfile({
        include: {
          specializations: true,
          certificates: true,
        },
      });

    const dp = prisma.user
      .findUnique({
        where: {
          id: user.id,
        },
      })
      .coachProfileDraft({
        include: {
          specializations: true,
          certificates: true,
        },
      });

    const [publishedProfile, draftProfile] = await Promise.all([pp, dp]);

    const diffList: FieldDiffMetada[] = [];
    const coachFieldsForShallowCompare: ComparableCoachField[] = [
      "name",
      "bio",
      "companyName",
      "addressLine1",
      "addressLine2",
      "zip",
      "city",
      "country",
      "appointmentTypes",
    ];

    for (const field of coachFieldsForShallowCompare) {
      if (isEmpty(draftProfile?.[field]) && isEmpty(publishedProfile?.[field])) {
        continue;
      }

      if (draftProfile?.[field] !== publishedProfile?.[field]) {
        diffList.push(
          getFieldDiffMetadata({
            field,
            draftProfile,
            publishedProfile,
          })
        );
      }
    }

    return { diffList };
  }),
  revertProfileChange: authedCoachProcedure
    .input(
      z.object({
        field: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      const draftProfile = await prisma.coach.findFirst({
        where: {
          userFromDraft: {
            id: user.id,
          },
        },
      });

      if (draftProfile?.reviewStatus === ReviewStatus.REVIEW_STARTED) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot perform changes when profile is being reviewed",
        });
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          coachProfileDraft: {
            update: {
              [input.field]: user.coachProfile?.[input.field as keyof Coach],
            },
          },
        },
      });
    }),
});
