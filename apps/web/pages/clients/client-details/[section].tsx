import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

import { Chat, ChatNotAvailable } from "@calcom/features/chat";
import ClientLayout from "@calcom/features/clients/layout/ClientLayout";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, SkeletonLoader } from "@calcom/ui";
import { FiDelete } from "@calcom/ui/components/icon";

import ClientBookings from "@components/clients/ClientBookings";
import Information from "@components/clients/Information";
import Notes from "@components/clients/Notes";

import { ssgInit } from "@server/lib/ssg";

const validSections = ["information", "chat", "bookings", "notes"] as const;
const validSectionEnum = z.enum(validSections);

const pathSchema = z.object({
  section: validSectionEnum,
});

export const querySchema = z.object({
  email: z.string(),
});

type QuerySchema = z.infer<typeof querySchema>;
type ValidSectionEnum = z.infer<typeof validSectionEnum>;

type ClientDetailsProps = {
  section: ValidSectionEnum;
};

export default function ClientDetails(props: ClientDetailsProps) {
  const router = useRouter();
  const { section } = props;

  const { email }: Partial<QuerySchema> = router.isReady ? querySchema.parse(router.query) : { email: "" };

  const query = trpc.viewer.clients.clientDetails.useQuery(
    {
      email,
    },
    { enabled: router.isReady && email.length !== 0 }
  );

  if (query.isError) {
    return (
      <div className="flex items-center justify-center pt-2 xl:pt-0">
        <EmptyScreen
          Icon={FiDelete}
          headline="Oh no!"
          description={query.error?.message ?? "An error occurred while searching for your clients"}
        />
      </div>
    );
  }

  const user = query.data;
  if (!user) {
    return <SkeletonLoader />;
  }

  return (
    <ClientLayout title={user.name ?? ""} heading={user.name ?? "N/A"} email={email}>
      {{
        information: () => <Information user={user} />,
        chat: () =>
          typeof user.id !== "undefined" ? <Chat otherPartyId={user.id.toString()} /> : <ChatNotAvailable />,
        bookings: () => <ClientBookings clientEmail={user?.email} />,
        notes: () => <Notes clientEmail={user?.email} />,
      }[section]()}
    </ClientLayout>
  );
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const params = pathSchema.safeParse(ctx.params);
  const ssg = await ssgInit(ctx);

  if (!params.success) return { notFound: true };

  return {
    props: {
      section: params.data.section,
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: validSections.map((section) => {
      return {
        params: { section },
        locale: "en",
      };
    }),
    fallback: "blocking",
  };
};
