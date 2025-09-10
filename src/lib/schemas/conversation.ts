import { z } from 'zod'

export const ConversationSchema = z.object({
  id: z.string(),
  counterpartName: z.string(),
  lastMessage: z.string(),
  updatedAt: z.number(),
  unreadCount: z.number().int().min(0),
  matchDetails: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
    corridor: z.string(),
  }).optional(),
})

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.number(),
  isRead: z.boolean(),
})

export type Conversation = z.infer<typeof ConversationSchema>
export type Message = z.infer<typeof MessageSchema>