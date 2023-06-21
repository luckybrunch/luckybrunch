export const normalizeIdForChat = (email = "") => email.replaceAll(/[^a-zA-Z0-9_]/g, "").toLowerCase();

export const generateChannelName = ({
  coachId = "",
  clientEmail = "",
}: {
  coachId?: number | string;
  clientEmail?: string;
}) => {
  return `c-${normalizeIdForChat(coachId.toString())}-${normalizeIdForChat(clientEmail)}`;
};
