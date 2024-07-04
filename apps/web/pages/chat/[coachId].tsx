import { useRouter } from "next/router";

import { Chat } from "@calcom/features/chat";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";

/**
 * Chat page for clients users to chat with their coach
 */
export default function ClientChat() {
  const { t } = useLocale();
  const coachId = useRouter().query.coachId;
  if (typeof coachId !== "string") {
    return null;
  }

  return (
    <Shell title="Chat" heading={t("lb_chat")} subtitle={t("lb_chat_with_your_coaches")}>
      <Chat otherPartyId={coachId} />
    </Shell>
  );
}
