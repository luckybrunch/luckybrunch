import z from "zod";

import type { PrismaClient } from "@calcom/prisma/client";
import { reviewSelect } from "@calcom/prisma/selects";

import { TRPCError } from "@trpc/server";

import { authedProcedure, publicProcedure, router } from "../../trpc";

async function canUserReviewCoach(prisma: PrismaClient, coachUserId: number, userEmail: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      attendees: {
        some: {
          email: userEmail,
        },
      },
      user: {
        id: coachUserId,
      },
    },
    select: {
      id: true,
    },
  });
  return booking !== null;
}

export const reviewsRouter = router({
  getRating: publicProcedure
    .input(
      z.object({
        coachUserId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { coachUserId } = input;
      const { prisma } = ctx;

      const res = await prisma.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
        where: { coachUserId },
      });

      const rating = res._avg.rating ?? 0;
      const reviewCount = res._count._all;

      return { rating, reviewCount };
    }),

  getReviews: publicProcedure
    .input(
      z.object({
        coachUserId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { coachUserId } = input;
      const { prisma } = ctx;

      const res = await prisma.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
        where: { coachUserId },
      });

      const rating = res._avg.rating ?? 0;
      const reviewCount = res._count._all;

      const reviews = await prisma.review.findMany({
        where: { coachUserId },
        select: reviewSelect,
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      return {
        rating,
        reviewCount,
        reviews,
      };
    }),

  getReviewContext: publicProcedure
    .input(
      z.object({
        coachUserId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user) return { canReview: false };

      const canReview = await canUserReviewCoach(ctx.prisma, input.coachUserId, ctx.user.email);
      const review = await ctx.prisma.review.findUnique({
        where: { coachUserId_userId: { coachUserId: input.coachUserId, userId: ctx.user.id } },
        select: reviewSelect,
      });

      return { canReview: canReview, review };
    }),

  writeReview: authedProcedure
    .input(
      z.object({
        coachUserId: z.number(),
        rating: z.number(),
        comment: z.string().transform((s) => s.trim()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { coachUserId, rating, comment } = input;
      const userId = ctx.user.id;
      const canReview = await canUserReviewCoach(ctx.prisma, input.coachUserId, ctx.user.email);
      if (!canReview) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const createdAt = new Date();

      await ctx.prisma.review.upsert({
        where: { coachUserId_userId: { coachUserId, userId } },
        create: { createdAt, coachUserId, userId, rating, comment },
        update: { createdAt, rating, comment },
      });
    }),
});
