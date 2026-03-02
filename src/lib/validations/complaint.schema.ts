import { z } from "zod";

export const complaintSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["PLUMBING", "ELECTRICAL", "CIVIL", "HOUSEKEEPING", "SECURITY", "PARKING", "NOISE", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;
export type CommentFormValues = z.infer<typeof commentSchema>;
