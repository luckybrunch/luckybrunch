import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { ReviewStatus } from "@prisma/client";
import { Coach, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import {
  ComparableCoachField,
  FieldDiffMetada,
  getFieldDiffMetadata,
  isEmpty,
} from "@calcom/features/coaches/lib/getDiffMetadata";
import { AppointmentType } from "@calcom/features/coaches/types";

import { TRPCError } from "@trpc/server";

import { router, publicProcedure, authedCoachProcedure } from "../../trpc";
import { UserType } from ".prisma/client";

export const coachesRouter = router({
  search: publicProcedure
    .input(
      z
        .object({
          filters: z.object({
            goals: z.string().array().optional(),
            maxDistance: z.number().optional(),
            maxPrice: z.number().optional(),
            meetingOptions: z.string().array().optional(),
            city: z.string().optional(),
          }),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const userSelect = Prisma.validator<Prisma.UserSelect>()({
        id: true,
        username: true,
        avatar: true,
        coachProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      });

      const baseFilters: Prisma.UserWhereInput = {
        userType: UserType.COACH,
        coachProfileId: { not: null },
      };

      // TODO: Received but ignored filters: maxDistance, maxPrice, goals
      const coachFilters: Prisma.CoachWhereInput = {};
      const hasFilters = Object.keys(input?.filters ?? {}).length > 0;

      if (input?.filters.city) {
        coachFilters.city = input.filters.city.toLowerCase();
      }

      if (input?.filters?.meetingOptions) {
        coachFilters.OR = [];

        const { meetingOptions } = input.filters;
        if (meetingOptions.includes(AppointmentType.OFFICE)) {
          coachFilters.OR.push({
            appointmentTypes: { contains: AppointmentType.OFFICE },
          });
        }

        if (meetingOptions.includes(AppointmentType.HOME)) {
          coachFilters.OR.push({
            appointmentTypes: { contains: AppointmentType.HOME },
          });
        }

        if (meetingOptions.includes(AppointmentType.ONLINE)) {
          coachFilters.OR.push({
            appointmentTypes: { contains: AppointmentType.ONLINE },
          });
        }
      }

      const matchedCoaches = await prisma.user.findMany({
        where: {
          ...baseFilters,
          coachProfile: coachFilters,
        },
        select: userSelect,
      });

      if (hasFilters && matchedCoaches.length > 0) {
        return {
          matched: true,
          list: matchedCoaches,
        };
      }

      const publishedCoaches = !hasFilters
        ? matchedCoaches
        : await prisma.user.findMany({
            where: {
              ...baseFilters,
            },
            select: userSelect,
          });

      return {
        matched: !hasFilters,
        list: publishedCoaches,
      };
    }),

  publicCoachProfile: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { prisma } = ctx;

    const userSelect = Prisma.validator<Prisma.UserSelect>()({
      id: true,
      username: true,
      emailVerified: true,
      avatar: true,
      coachProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          addressLine1: true,
          zip: true,
          city: true,
          appointmentTypes: true,
          specializations: {
            select: {
              id: true,
              icon: true,
              label: true,
            },
          },
          certificates: {
            select: {
              id: true,
              name: true,
              fileUrl: true,
            },
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { username: input },
      select: userSelect,
    });

    if (!user || !user.coachProfile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found" });
    }

    return user;
  }),

  getSignedUrl: authedCoachProcedure.query(async () => {
    const s3Bucket = process.env.S3_BUCKET || "";
    const s3Endpoint = process.env.S3_ENDPOINT || "";
    const s3Region = process.env.S3_REGION || "";
    const s3Key = process.env.S3_KEY || "";
    const s3Secret = process.env.S3_SECRET || "";
    const maxBytes = 1048576 /* 1MB */ * 5;

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
      "firstName",
      "lastName",
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
              [input.field]: user.coachProfile?.[input.field as keyof Coach] ?? "",
            },
          },
        },
      });
    }),
});
