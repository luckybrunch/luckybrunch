import { publicProcedure, router } from "../../trpc";

export const userProfileRouter = router({
  getUserProfileList: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const userProfileInfo = await prisma.user.findMany({
      where: { id: ctx.user.id },
      select: {
        specializations: {
          select: {
            label: true,
          },
        },
        addressLine1: true,
        zip: true,
        city: true,
        certificates: {
          select: {
            name: true,
          },
        },
      },
    });
    return userProfileInfo;  
  }),
});
