import { z } from "zod";

export const convertValidator = z.object({
  from: z.string().min(3).max(3).toUpperCase(),
  amount: z.number().positive(),
  to: z.array(z.string().min(3).max(3)),
});
