import { z } from "zod";

export const societyProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  registrationNo: z.string().optional(),
});

export const blockSchema = z.object({
  name: z.string().min(1, "Block name is required"),
});

export const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().min(0, "Floor must be 0 or above"),
  type: z.enum(["STUDIO", "ONE_BHK", "TWO_BHK", "THREE_BHK", "FOUR_BHK", "PENTHOUSE", "SHOP", "OFFICE"]),
  area: z.number().positive().optional(),
  blockId: z.string().min(1, "Block is required"),
});

export type SocietyProfileFormValues = z.infer<typeof societyProfileSchema>;
export type BlockFormValues = z.infer<typeof blockSchema>;
export type UnitFormValues = z.infer<typeof unitSchema>;
