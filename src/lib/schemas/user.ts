import { z } from 'zod'

export const KycStatusSchema = z.enum(['unverified', 'pending', 'verified'])

export const UserRatingSchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalRatings: z.number().int().min(0),
  ratingsBreakdown: z.record(z.string(), z.number().int().min(0)),
  canRate: z.boolean(),
  lastRatedAt: z.string().datetime().optional(),
})

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  kycStatus: KycStatusSchema,
  ratingAvg: z.number().min(0).max(5),
  avatarUrl: z.string().url().optional(),
  avatarUpdatedAt: z.number().optional(),
  userRating: UserRatingSchema.optional(),
})

export type KycStatus = z.infer<typeof KycStatusSchema>
export type UserRating = z.infer<typeof UserRatingSchema>
export type User = z.infer<typeof UserSchema>