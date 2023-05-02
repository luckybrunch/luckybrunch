import { Attendee } from "@prisma/client";
import { z } from "zod";

import { authedProcedure, router } from "../../trpc";

export const customersRouter = router({
  myCustomers: authedProcedure.query(async ({ ctx }) => {
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

    const customers: Pick<Attendee, "name" | "email">[] = [];

    // Prevent duplicate records of attendees
    bookings
      .map((booking) => booking.attendees)
      .flat()
      .forEach((attendee) => {
        // If the attendee is present in the unique customer list, skip them
        if (customers.findIndex((customer) => customer.email === attendee.email) !== -1) {
          return;
        }

        customers.push(attendee);
      });

    return customers;
  }),
  customerDetails: authedProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { email } = input;

      let customerDetails;

      customerDetails = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      // Queried email may not be a user in the db yet i.e the user didn't complete the signup process
      if (!customerDetails) {
        customerDetails = await prisma.attendee.findFirst({
          where: {
            email,
          },
        });
      }

      return customerDetails;
    }),
  customerBookings: authedProcedure
    .input(
      z.object({
        customerEmail: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { customerEmail } = input;

      const bookings = await prisma.booking.findMany({
        include: {
          // TODO: Consider including this when the component for listing booking item is updated / changed
          // currently it's a must include for listing using the <BookingListItem /> component
          attendees: true,
        },
        where: {
          attendees: {
            some: {
              email: customerEmail,
            },
          },
          endTime: { gte: new Date() },
        },
      });

      return bookings;
    }),
});
