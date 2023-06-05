import { z } from "zod";

import { useTypedQuery } from "@calcom/lib/hooks/useTypedQuery";

export const coachFilterQuerySchema = z.object({
  goals: z.string().array().optional(),
  maxDistance: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inPerson: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  city: z.string().optional(),
});

export const useCoachFilterQuery = () => {
  return useTypedQuery(coachFilterQuerySchema);
};
