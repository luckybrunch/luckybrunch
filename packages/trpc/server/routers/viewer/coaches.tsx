import { CustomerType } from "@prisma/client";

import { router, publicProcedure } from "../../trpc";

export const coachesRouter = router({
  search: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const coaches = await prisma.user.findMany({
      where: {
        customerType: CustomerType.COACH,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        specializations: {
          select: {
            id: true,
            icon: true,
            label: true,
          },
        },
      },
    });

    return coaches;
  }),
});
