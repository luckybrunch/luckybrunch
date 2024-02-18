import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui";

import { useChannelUnreadCount, useChatTotalUnreadCount } from "../lib/hooks";

export function UnreadMessagesBadge() {
  const { t } = useLocale();
  const count = useChatTotalUnreadCount();

  if (!count) return null;

  return (
    <Badge rounded title={t("lb_you_have_unread_messages")} variant="orange">
      {count}
    </Badge>
  );
}

export function UnreadMessagesChannelBadge({ otherPartyId }: { otherPartyId: string }) {
  const { t } = useLocale();
  const count = useChannelUnreadCount(otherPartyId);

  if (!count) return null;

  return (
    <Badge rounded title={t("lb_you_have_unread_messages")} variant="orange">
      {count}
    </Badge>
  );
}
