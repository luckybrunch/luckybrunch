import { UserType } from "@prisma/client";
import Link from "next/link";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { Badge } from "@calcom/ui";

export default function UnreadMessageBadge() {
  const { t } = useLocale();
  const { data: me } = useMeQuery();
  const { data: unreadCounts } = trpc.viewer.chat.unreadCounts.useQuery();

  const href = me?.userType === UserType.COACH ? "/clients" : "/coaches";

  if (!unreadCounts || unreadCounts.total < 1) return null;

  return (
    <Link href={href}>
      <Badge
        rounded
        title={t("lb_you_have_unread_messages")}
        variant="orange"
        className="cursor-pointer hover:bg-orange-800 hover:text-orange-100">
        {unreadCounts.total}
      </Badge>
    </Link>
  );
}
