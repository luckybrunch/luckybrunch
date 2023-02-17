import z from "zod";

import { authedProcedure, router } from "../../trpc";

export const profileRouter = router({
  getCertificates: authedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const certificates = await prisma.certificate.findMany({
      where: { userId: ctx.user.id },
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

  addCertificate: authedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        typeId: z.number(),
        fileUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      await prisma.certificate.create({
        data: {
          userId: user.id,
          name: input.name,
          description: input.description,
          typeId: input.typeId,
          fileUrl: input.fileUrl,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          completedProfileCertificates: true,
        },
      });
    }),
});
