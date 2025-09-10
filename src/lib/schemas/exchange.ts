import { z } from 'zod'

export const RequestTypeSchema = z.enum(['SEND', 'RECEIVE'])
export const RequestStatusSchema = z.enum(['OPEN', 'MATCHED', 'CLOSED'])
export const MatchStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'EXPIRED'])

export const RequestItemSchema = z.object({
  id: z.string(),
  type: RequestTypeSchema,
  amount: z.number().positive(),
  currency: z.string().length(3), // ISO currency codes
  originCountry: z.string(),
  destCountry: z.string(),
  status: RequestStatusSchema,
})

export const MatchItemSchema = z.object({
  id: z.string(),
  counterpartName: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  corridor: z.string(),
  status: MatchStatusSchema,
})

export const SuggestedItemSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  originCountryName: z.string(),
  destCountryName: z.string(),
  senderName: z.string(),
  note: z.string().optional(),
  createdAt: z.number(),
  isAccepted: z.boolean().optional(),
  conversationId: z.string().optional(),
})

export type RequestType = z.infer<typeof RequestTypeSchema>
export type RequestStatus = z.infer<typeof RequestStatusSchema>
export type MatchStatus = z.infer<typeof MatchStatusSchema>
export type RequestItem = z.infer<typeof RequestItemSchema>
export type MatchItem = z.infer<typeof MatchItemSchema>
export type SuggestedItem = z.infer<typeof SuggestedItemSchema>