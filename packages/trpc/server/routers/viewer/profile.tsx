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
});
