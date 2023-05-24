import z from "zod";

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
        description: true,
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
        description: z.string(),
        typeId: z.number(),
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
            description: input.description,
            typeId: input.typeId,
            fileUrl: input.fileUrl,
          },
        });
      } else {
        await prisma.certificate.create({
          data: {
            coachId: user.coachProfileDraft!.id!,
            name: input.name,
            description: input.description,
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
  setCompletedProfileServices: authedProcedure
    .input(
      z.object({
        completedProfileServices: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      const completedProfileServices = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          completedProfileServices: input.completedProfileServices,
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
