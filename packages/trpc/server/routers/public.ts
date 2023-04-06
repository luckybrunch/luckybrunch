import { publicProcedure, router } from "../trpc";

export const publicRouter = router({
  getSpecializations: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.specialization.findMany();
  }),
  getCertificateTypes: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.certificateType.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
