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
import { User } from "@calcom/prisma/client";
import { baseEventTypeSelect } from "@calcom/prisma/selects";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";

import { TRPCError } from "@trpc/server";

import { router, publicProcedure, authedCoachProcedure } from "../../trpc";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

export const coachesRouter = router({
  search: publicProcedure
    .input(
      z
        .object({
          filters: z.object({
            goals: z.array(z.string().transform((v) => z.coerce.number().parse(v))).optional(),
            meetingOptions: z.string().array().optional(),
          }),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const goals = input?.filters?.goals ?? [];
      const meetingOptions = input?.filters?.meetingOptions ?? [];

      type Result = Prettify<
        { uid: User["id"] } & Pick<User, "username"> &
          Pick<Coach, "id" | "avatar" | "firstName" | "lastName" | "bio">
      >;

      const search = (goals: Array<number>, meetingOptions: Array<string>) => prisma.$queryRaw<Array<Result>>`
        select "users"."id" as uid, "users"."username", "Coach"."id", "Coach"."avatar", "Coach"."firstName", "Coach"."lastName", "Coach"."bio"
        from "users"
        inner join "Coach" on "users"."coachProfileId" = "Coach"."id"
        where "users"."userType" = 'COACH' and "users"."coachProfileId" is not null
        and
          case when ${goals.length} > 0 then "Coach"."id" in (select "A" from "_CoachToSpecialization" where "B" = ANY(${goals})) else true end
        and
          case when ${meetingOptions.length} > 0 then string_to_array("Coach"."appointmentTypes", ',') && ${meetingOptions} else true end
      `;

      const matches = await search(goals, meetingOptions);
      const extraResults = matches.length === 0 ? await search([], []) : [];

      return {
        hasMatches: matches.length > 0,
        results: matches.length > 0 ? matches : extraResults,
      };
    }),

  publicCoachProfile: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { prisma } = ctx;

    const userSelect = Prisma.validator<Prisma.UserSelect>()({
      id: true,
      username: true,
      emailVerified: true,
      createdDate: true,
      avatar: true,
      coachProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
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

  publicCoachServices: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const { prisma } = ctx;
    const user = await prisma.user.findUnique({
      where: { username: input },
      select: { id: true, coachProfileId: true },
    });
    if (!user || !user.coachProfileId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found" });
    }

    const eventTypesWithHidden = (
      await prisma.eventType.findMany({
        where: {
          AND: [
            {
              teamId: null,
            },
            {
              OR: [
                {
                  userId: user.id,
                },
                {
                  users: {
                    some: {
                      id: user.id,
                    },
                  },
                },
              ],
            },
          ],
        },
        orderBy: [
          {
            position: "desc",
          },
          {
            id: "asc",
          },
        ],
        select: {
          ...baseEventTypeSelect,
          metadata: true,
        },
      })
    ).map((eventType) => ({
      ...eventType,
      metadata: EventTypeMetaDataSchema.parse(eventType.metadata || {}),
    }));

    return eventTypesWithHidden.filter((evt) => !evt.hidden);
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
      "avatar",
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
