import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["GENERAL", "MAINTENANCE", "EVENT", "EMERGENCY", "MEETING"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  isPublished: z.boolean(),
});

export type NoticeFormValues = z.infer<typeof noticeSchema>;
