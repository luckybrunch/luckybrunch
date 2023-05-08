import { Attendee } from "@prisma/client";
import { z } from "zod";

import { authedProcedure, router } from "../../trpc";

export const clientsRouter = router({
  myClients: authedProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        attendees: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const clients: Pick<Attendee, "name" | "email">[] = [];

    // Prevent duplicate records of attendees
    bookings
      .map((booking) => booking.attendees)
      .flat()
      .forEach((attendee) => {
        // If the attendee is present in the unique client list, skip them
        if (clients.findIndex((client) => client.email === attendee.email) !== -1) {
          return;
        }

        clients.push(attendee);
      });

    return clients;
  }),
  clientDetails: authedProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { email } = input;

      let clientDetails;

      clientDetails = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      // Queried email may not be a user in the db yet i.e the user didn't complete the signup process
      if (!clientDetails) {
        clientDetails = await prisma.attendee.findFirst({
          where: {
            email,
          },
        });
      }

      return clientDetails;
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
        include: {
          // TODO: Consider including this when the component for listing booking item is updated / changed
          // currently it's a must include for listing using the <BookingListItem /> component
          attendees: true,
        },
        where: {
          attendees: {
            some: {
              email: clientEmail,
            },
          },
          endTime: { gte: new Date() },
        },
      });

      return bookings;
    }),
});
