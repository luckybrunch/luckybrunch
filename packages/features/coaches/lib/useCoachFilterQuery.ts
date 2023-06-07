import { castArray } from "lodash";
import { z } from "zod";

import { useTypedQuery } from "@calcom/lib/hooks/useTypedQuery";

export const coachFilterQuerySchema = z.object({
  // Casting needed because, if single option is selected then it's recorded as a string rather than string[]
  goals: z.string().array().transform(castArray).optional(),
  maxDistance: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  meetingOptions: z.string().array().transform(castArray).optional(),
  city: z.string().optional(),
});

export const useCoachFilterQuery = () => {
  return useTypedQuery(coachFilterQuerySchema);
};
