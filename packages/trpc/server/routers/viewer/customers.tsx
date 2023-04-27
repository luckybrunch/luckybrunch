import { Attendee } from "@prisma/client";

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
});
