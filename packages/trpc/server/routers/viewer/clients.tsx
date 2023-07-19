import { Attendee } from "@prisma/client";
import { UserType } from "@prisma/client";
import { PrismaClient, BookingStatus } from "@prisma/client";
import Stripe from "stripe";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { authedCoachProcedure, authedProcedure, router } from "../../trpc";

const getClientListForCoach = async (prisma: PrismaClient, coachId: number) => {
  const bookings = await prisma.booking.findMany({
    where: {
      userId: coachId,
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

      if (clientList.findIndex((client) => client.email === email) === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Details for the specified client are not found",
        });
      }

      let clientDetails;

      clientDetails = await prisma.user.findUnique({
        where: { email },
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
    });

    return bookings.map((booking) => booking.user).filter(Boolean);
  }),
  generateStripeCheckoutSession: authedProcedure
    .input(
      z.object({
        eventTypeId: z.number(),
        bookingUid: z.string(),
        bookerEmail: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;

      const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY ?? "", {
        apiVersion: "2020-08-27",
      });

      const eventType = await prisma.eventType.findUnique({
        where: {
          id: input.eventTypeId,
        },
        select: {
          title: true,
          price: true,
          currency: true,
          slug: true,
        },
      });

      if (!eventType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event type not found",
        });
      }

      const URL = process.env.NEXT_PUBLIC_WEBAPP_URL;
      let successUrl = `${URL}/booking/${input.bookingUid}?isSuccessBookingPage=true&eventTypeSlug=${eventType.slug}`;

      if (input.bookerEmail) {
        successUrl += `&email=${input.bookerEmail}`;
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: eventType.currency,
              unit_amount: eventType.price,
              product_data: {
                name: eventType.title,
              },
            },
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: `${URL}/bookings/upcoming`,
      });

      if (!session.url) {
        throw new TRPCError({
          message: "Failed to generate checkout url for Stripe with the given input",
          code: "BAD_REQUEST",
        });
      }

      return session.url;
    }),
  validatePayment: authedProcedure
    .input(
      z.object({
        uid: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;

      await prisma.booking.update({
        where: {
          uid: input.uid,
        },
        data: {
          paid: true,
          status: BookingStatus.ACCEPTED,
        },
      });
    }),
});
