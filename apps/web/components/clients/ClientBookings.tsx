import { trpc } from "@calcom/trpc/react";

import BookingListItem from "@components/booking/BookingListItem";

export default function ClientBookings({ clientEmail }: { clientEmail?: string }) {
  const query = trpc.viewer.clients.clientBookings.useQuery(
    {
      clientEmail: clientEmail ?? "",
    },
    {
      enabled: !!clientEmail,
    }
  );
  const bookings = query.data;

  return (
    <table className="w-full max-w-full table-fixed">
      <tbody className="divide-y divide-gray-200 bg-white">
        {bookings?.map((booking) => {
          return <BookingListItem key={booking.id} {...booking} />;
        })}
      </tbody>
    </table>
  );
}
