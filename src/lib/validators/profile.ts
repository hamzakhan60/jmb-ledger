import { z } from "zod";

export const UpdateProfileSchema = z.object({
  email: z.string().email().optional(),
});

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;
