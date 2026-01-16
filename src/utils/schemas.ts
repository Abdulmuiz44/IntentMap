import { z } from 'zod';

export const AnalysisResultSchema = z.object({
  pain_score: z.number().int().min(1).max(10),
  wtp_signal: z.boolean(),
  hard_pain_summary: z.string().nullable().optional(),
  mom_test_question: z.string().nullable().optional(),
  is_high_intent: z.boolean(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const RedditPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  selftext: z.string(),
  author: z.object({
    name: z.string(),
  }),
  permalink: z.string(),
  url: z.string().optional(),
  created_utc: z.number(),
});

// Snoowrap posts have more fields, but these are what we care about validating for our logic
export type RedditPost = z.infer<typeof RedditPostSchema>;
