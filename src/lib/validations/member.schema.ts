import { z } from "zod";

export const memberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
  unitId: z.string().min(1, "Unit is required"),
  ownershipType: z.enum(["OWNER", "TENANT", "FAMILY"]),
  moveInDate: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;
