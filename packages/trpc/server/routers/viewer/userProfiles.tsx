import { authedProcedure, router } from "../../trpc";

export const userProfileRouter = router({
  getUserProfileList: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    const userProfileInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        coachProfile: {
          select: {
            addressLine1: true,
            zip: true,
            city: true,
            specializations: {
              select: {
                label: true,
              },
            },
            certificates: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return userProfileInfo;
  }),
});
