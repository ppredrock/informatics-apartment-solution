import { z } from "zod";

export const visitorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  purpose: z.enum(["GUEST", "DELIVERY", "CAB", "SERVICE", "OTHER"]),
  purposeDetail: z.string().optional(),
  vehicleNo: z.string().optional(),
  unitId: z.string().min(1, "Unit/Flat is required"),
});

export const preApprovalSchema = z.object({
  visitorName: z.string().min(2, "Name is required"),
  visitorPhone: z.string().optional(),
  purpose: z.string().optional(),
  validFrom: z.string().min(1, "Start date is required"),
  validUntil: z.string().min(1, "End date is required"),
});

export type VisitorFormValues = z.infer<typeof visitorSchema>;
export type PreApprovalFormValues = z.infer<typeof preApprovalSchema>;
