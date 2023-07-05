import { Attendee, User } from "@prisma/client";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

import Chat from "@calcom/features/chat/components/Chat";
import ClientLayout from "@calcom/features/clients/layout/ClientLayout";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, SkeletonLoader } from "@calcom/ui";
import { FiDelete } from "@calcom/ui/components/icon";

import useMeQuery from "@lib/hooks/useMeQuery";

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

function SectionContent({
  user,
  section,
  queryStatus,
  errorMessage,
}: {
  queryStatus: "success" | "error" | "loading";
  user?: Attendee | User | null;
  errorMessage?: string;
} & ClientDetailsProps) {
  const { data: me } = useMeQuery();
  const { data: chatCredentials } = trpc.viewer.chat.getCredentials.useQuery(
    { userChatId: me?.id.toString() || "" },
    {
      enabled: !!me,
    }
  );

  if (queryStatus === "success") {
    return (
      <>
        {section === "information" && <Information />}
        {section === "chat" && chatCredentials && (
          <Chat chatCredentials={{ token: chatCredentials.token }} otherParty={user} />
        )}
        {section === "bookings" && <ClientBookings clientEmail={user?.email} />}
        {section === "notes" && <Notes clientEmail={user?.email} />}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center pt-2 xl:pt-0">
      <EmptyScreen
        Icon={FiDelete}
        headline="An error occurred"
        description={errorMessage ?? "An error occurred while listing client information"}
      />
    </div>
  );
}

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

  const user = query.data;

  if (query.status === "loading" || query.isPaused) {
    return <SkeletonLoader />;
  }

  return (
    <ClientLayout
      subtitle="Manage settings for your nutritionist profile"
      title={user?.name ?? "N/A"}
      heading={user?.name ?? "N/A"}
      email={email}>
      <SectionContent
        user={user}
        errorMessage={query.error?.message}
        queryStatus={query.status}
        section={section as ValidSectionEnum}
      />
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
