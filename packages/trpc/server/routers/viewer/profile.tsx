import z from "zod";

import { Prisma } from "@calcom/prisma/client";

import { authedCoachProcedure, authedProcedure, router } from "../../trpc";

export const profileRouter = router({
  getCertificates: authedCoachProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    const certificates = await prisma.certificate.findMany({
      where: {
        coachId: user.coachProfileDraft?.id,
      },
      select: {
        id: true,
        name: true,
        fileUrl: true,
        type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return certificates;
  }),

  getOnboardingFlags: authedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const flags = await prisma.user.findUniqueOrThrow({
      where: { id: ctx.user.id },
      select: {
        completedProfileInformations: true,
        completedProfileCertificates: true,
        completedProfileServices: true,
        requestedReviewAt: true,
        reviewedAt: true,
      },
    });

    return flags;
  }),

  setOnboardingFlag: authedProcedure
    .input(
      z.object({
        completedProfileInformations: z.literal(true).optional(),
        completedProfileCertificates: z.literal(true).optional(),
        completedProfileServices: z.literal(true).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const data: Prisma.UserUpdateInput = {};

      if (input.completedProfileInformations) data.completedProfileInformations = true;
      if (input.completedProfileCertificates) data.completedProfileCertificates = true;
      if (input.completedProfileServices) data.completedProfileServices = true;

      await prisma.user.update({ where: { id: user.id }, data });
    }),

  getSpecializations: authedCoachProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    const specializations = await prisma.coach
      .findFirst({
        where: {
          userFromDraft: {
            id: user.id,
          },
        },
        select: {
          specializations: true,
        },
      })
      .specializations();

    return specializations || [];
  }),

  updateCertificate: authedCoachProcedure
    .input(
      z.object({
        certId: z.number().optional(),
        name: z.string(),
        typeId: z.number().nullable(),
        fileUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      if (input.certId) {
        await prisma.certificate.updateMany({
          where: {
            id: input.certId,
            coachId: user.coachProfileDraft?.id,
          },
          data: {
            name: input.name,
            typeId: input.typeId,
            fileUrl: input.fileUrl,
          },
        });
      } else {
        await prisma.certificate.create({
          data: {
            coachId: user.coachProfileDraft!.id!,
            name: input.name,
            typeId: input.typeId,
            fileUrl: input.fileUrl,
          },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          completedProfileCertificates: true,
        },
      });
    }),

  deleteCertificate: authedCoachProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      await prisma.certificate.deleteMany({ where: { coachId: user.coachProfileDraft?.id, id: input.id } });
    }),
});
