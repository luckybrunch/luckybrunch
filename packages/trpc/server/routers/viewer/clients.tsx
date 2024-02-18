import { UserType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { authedCoachProcedure, authedProcedure, router } from "../../trpc";

const getClientListForCoach = async (prisma: PrismaClient, coachId: number) => {
  const attendees = await prisma.attendee.findMany({
    where: {
      booking: { userId: coachId },
    },
    select: {
      name: true,
      email: true,
    },
    distinct: ["email"],
  });

  const users = await prisma.user.findMany({
    where: {
      email: { in: attendees.map((attendee) => attendee.email) },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  const clients: Array<{
    id: number | undefined;
    name: string;
    email: string;
    avatar: string | undefined;
  }> = [];

  for (const attendee of attendees) {
    const user = users.find((user) => user.email === attendee.email);

    clients.push({
      id: user?.id,
      name: user?.name ?? attendee.name,
      email: attendee.email,
      avatar: user?.avatar ?? undefined,
    });
  }

  return clients;
};

export const clientsRouter = router({
  myClients: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;
    return await getClientListForCoach(prisma, user.id);
  }),
  clientDetails: authedCoachProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const { email } = input;

      const clientList = await getClientListForCoach(prisma, user.id);
      const client = clientList.find((client) => client.email === email);

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Details for the specified client are not found",
        });
      }

      return client;
    }),
  clientBookings: authedProcedure
    .input(
      z.object({
        clientEmail: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { clientEmail } = input;

      const bookings = await prisma.booking.findMany({
        where: {
          userId: ctx.user.id,
          attendees: {
            some: {
              email: clientEmail,
            },
          },
        },
        include: {
          // TODO: Consider including this when the component for listing booking item is updated / changed
          // currently it's a must include for listing using the <BookingListItem /> component
          attendees: true,
        },
      });

      return bookings;
    }),
  clientNotes: authedCoachProcedure
    .input(
      z.object({
        clientEmail: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      const clientNotes = await prisma.clientNotes.findUnique({
        where: {
          coachUserId_clientEmail: {
            coachUserId: user.id,
            clientEmail: input.clientEmail,
          },
        },
      });

      if (!clientNotes) {
        return "";
      }

      return clientNotes.content;
    }),
  setClientNotes: authedCoachProcedure
    .input(
      z.object({
        clientEmail: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;

      await prisma.clientNotes.upsert({
        where: {
          coachUserId_clientEmail: {
            coachUserId: user.id,
            clientEmail: input.clientEmail,
          },
        },
        create: {
          coachUserId: user.id,
          clientEmail: input.clientEmail,
          content: input.content,
        },
        update: {
          content: input.content,
        },
      });
    }),
  myCoaches: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    const bookings = await prisma.booking.findMany({
      where: {
        attendees: {
          some: {
            email: user.email,
          },
        },
        user: {
          userType: UserType.COACH,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            coachProfile: true,
          },
        },
      },
      distinct: ["userId"],
    });

    return bookings.map((booking) => booking.user).filter((v): v is NonNullable<typeof v> => v !== null);
  }),
});
