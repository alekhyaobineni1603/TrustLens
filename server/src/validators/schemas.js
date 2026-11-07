import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  password: z.string().min(8).max(100)
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
export const analysisSchema = z.object({
  submissionType: z.enum(['TEXT', 'URL', 'CLAIM']),
  text: z.string().optional(),
  url: z.string().url().optional()
}).superRefine((v, ctx) => {
  if (v.submissionType === 'URL' && !v.url) ctx.addIssue({ code: 'custom', message: 'A valid URL is required', path: ['url'] });
  if (v.submissionType !== 'URL' && !v.text?.trim()) ctx.addIssue({ code: 'custom', message: 'Text is required', path: ['text'] });
});
