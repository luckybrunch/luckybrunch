import { prisma } from "@calcom/prisma";

export async function getCoachOfficeAddress(userId: number) {
  const { coachProfile: c } =
    (await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        coachProfile: {
          select: {
            companyName: true,
            addressLine1: true,
            addressLine2: true,
            zip: true,
            city: true,
            country: true,
          },
        },
      },
    })) ?? {};

  if (!c) return "";

  return [c.companyName, c.addressLine1, c.addressLine2, `${c.zip} ${c.city}`, c.country]
    .filter(Boolean)
    .join("\n");
}
