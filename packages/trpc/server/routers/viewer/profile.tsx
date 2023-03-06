import z from "zod";

import { authedProcedure, router } from "../../trpc";

export const profileRouter = router({
  getCertificates: authedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;
    const certificates = await prisma.certificate.findMany({
      where: { userId: ctx.user.id },
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
  getCertificateTypes: authedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const certificateTypes = await prisma.certificateType.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return certificateTypes;
  }),

  updateCertificate: authedProcedure
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
            userId: ctx.user.id,
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
            userId: user.id,
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
      const completedProfileServices = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          completedProfileServices: input.completedProfileServices,
        },
      });
    }),

  deleteCertificate: authedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      await prisma.certificate.deleteMany({ where: { userId: ctx.user.id, id: input.id } });
    }),
});
