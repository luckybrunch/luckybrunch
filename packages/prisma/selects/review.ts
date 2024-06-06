import { Prisma } from "@prisma/client";

export const reviewSelect = Prisma.validator<Prisma.ReviewSelect>()({
  id: true,
  createdAt: true,
  rating: true,
  comment: true,
  user: { select: { firstName: true } },
});
