import { z } from "zod";

import { useTypedQuery } from "@calcom/lib/hooks/useTypedQuery";

export const coachFilterQuerySchema = z.object({
  goals: z.preprocess((v) => (Array.isArray(v) ? v : [v]), z.array(z.string())).optional(),
  maxDistance: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  meetingOptions: z.preprocess((v) => (Array.isArray(v) ? v : [v]), z.array(z.string())).optional(),
  city: z.string().optional(),
});

export const useCoachFilterQuery = () => {
  return useTypedQuery(coachFilterQuerySchema);
};
