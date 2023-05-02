import { Attendee, User } from "@prisma/client";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

import CustomerLayout from "@calcom/features/customers/layout/CustomerLayout";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, SkeletonLoader } from "@calcom/ui";
import { FiDelete } from "@calcom/ui/components/icon";

import Chat from "@components/customers/Chat";
import ClientBookings from "@components/customers/ClientBookings";
import Information from "@components/customers/Information";
import Notes from "@components/customers/Notes";

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

type CustomerDetailsProps = {
  section: ValidSectionEnum;
};

function SectionContent({
  user,
  section,
  queryStatus,
}: {
  user?: Attendee | User | null;
  queryStatus: "success" | "error" | "loading";
} & CustomerDetailsProps) {
  if (queryStatus === "success") {
    return (
      <>
        {section === "information" && <Information />}
        {section === "chat" && <Chat />}
        {section === "bookings" && <ClientBookings customerEmail={user?.email} />}
        {section === "notes" && <Notes />}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center pt-2 xl:pt-0">
      <EmptyScreen
        Icon={FiDelete}
        headline="An error occurred"
        description="An error occurred while listing customer information"
      />
    </div>
  );
}

export default function CustomerDetails(props: CustomerDetailsProps) {
  const router = useRouter();
  const { section } = props;

  const { email }: Partial<QuerySchema> = router.isReady ? querySchema.parse(router.query) : { email: "" };

  const query = trpc.viewer.customers.customerDetails.useQuery(
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
    <CustomerLayout
      subtitle="Manage settings for your nutritionist profile"
      title={user?.name ?? "N/A"}
      heading={user?.name ?? "N/A"}
      email={email}>
      <SectionContent user={user} queryStatus={query.status} section={section as ValidSectionEnum} />
    </CustomerLayout>
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
