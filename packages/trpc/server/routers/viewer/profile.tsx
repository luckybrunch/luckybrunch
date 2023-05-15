import z from "zod";

import { TRPCError } from "@trpc/server";

import { authedProcedure, router } from "../../trpc";

export const profileRouter = router({
  getCertificates: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    if (!user.coachProfile) {
      throw new TRPCError({
        message: "User must have a coach profile in order to retrieve certificates",
        code: "NOT_FOUND",
      });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        coach: {
          user: {
            id: user.coachProfile.id,
          },
        },
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

  getSpecializations: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    if (!user.coachProfile) {
      throw new TRPCError({
        message: "User must have a coach profile in order to retireve specializations",
        code: "NOT_FOUND",
      });
    }

    const specializations = await prisma.coach
      .findFirst({
        where: {
          user: {
            id: user.coachProfile.id,
          },
        },
        select: {
          specializations: true,
        },
      })
      .specializations();
    return specializations || [];
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
            coachId: user.coachProfile?.id,
          },
          data: {
            name: input.name,
            description: input.description,
            typeId: input.typeId,
            fileUrl: input.fileUrl,
          },
        });
      } else {
        if (!user.coachProfile?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User must have a coach profile in order to add a new certificate",
          });
        }

        await prisma.certificate.create({
          data: {
            coachId: user.coachProfile?.id,
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

  deleteCertificate: authedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      if (!user.coachProfile) {
        throw new TRPCError({
          message: "User must have a coach profile in order to delete a certificate",
          code: "NOT_FOUND",
        });
      }

      await prisma.certificate.deleteMany({ where: { coachId: user.coachProfile.id, id: input.id } });
    }),
});
