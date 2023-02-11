import { authedProcedure, router } from "../../trpc";

export const profileRouter = router({
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
