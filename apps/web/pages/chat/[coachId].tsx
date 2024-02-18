import { useRouter } from "next/router";

import { Chat } from "@calcom/features/chat";
import Shell from "@calcom/features/shell/Shell";

/**
 * Chat page for clients users to chat with their coach
 */
export default function ClientChat() {
  const coachId = useRouter().query.coachId;
  if (typeof coachId !== "string") {
    return null;
  }

  return (
    <Shell
      title="Chat"
      heading="Chat with your coach"
      subtitle="Chat with your coach and discuss things in more detail">
      <Chat otherPartyId={coachId} />
    </Shell>
  );
}
