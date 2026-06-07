'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Skeleton } from '@/components/ui'
import { ChatBubble } from '@/components/app/ChatBubble'
import { useSessionUser } from '@/components/app/SessionProvider'
import { useMessages, queryKeys } from '@/lib/queries'
import { markConversationAsRead, sendMessage } from '@/lib/actions/messages'

export function ChatRoom({ conversationId }: { conversationId: string }) {
  const { id: meId } = useSessionUser()
  const queryClient = useQueryClient()
  const { data: messages, isLoading, isError } = useMessages(conversationId)

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Clear the unread count on mount and whenever the loaded messages change.
  useEffect(() => {
    void markConversationAsRead(conversationId).catch(() => {
      // Non-blocking: a failed read marker should not break the chat.
    })
  }, [conversationId, messages?.length])

  // Auto-scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setSendError(null)
    try {
      await sendMessage(conversationId, trimmed)
      setText('')
      await queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) })
    } catch {
      setSendError('Échec de l’envoi. Réessayez.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem-3rem)] flex-col sm:h-[calc(100dvh-4rem-4rem)]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-800 pb-3">
        <Link
          href="/app/messages"
          className="focus-visible:ring-brand-yellow inline-flex h-9 items-center rounded-lg px-2 text-sm text-neutral-400 outline-none transition-colors hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          ← Retour
        </Link>
        <h1 className="text-foreground truncate text-base font-semibold tracking-tight">
          Conversation
        </h1>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-48 self-start rounded-2xl" />
            <Skeleton className="h-10 w-40 self-end rounded-2xl" />
            <Skeleton className="h-12 w-56 self-start rounded-2xl" />
          </div>
        )}

        {isError && !isLoading && (
          <p className="py-12 text-center text-sm text-neutral-400">
            Impossible de charger les messages. Réessayez dans un instant.
          </p>
        )}

        {!isLoading && !isError && messages && messages.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-500">
            Aucun message pour l’instant. Lancez la conversation.
          </p>
        )}

        {!isLoading && !isError && messages && messages.length > 0 && (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                content={msg.content}
                isOwn={msg.senderId === meId}
                createdAt={msg.createdAt}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 flex-col gap-1.5 border-t border-gray-800 pt-3"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Votre message
          </label>
          <input
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez un message…"
            autoComplete="off"
            disabled={sending}
            className="text-foreground focus-visible:border-brand-yellow focus-visible:ring-brand-yellow h-11 flex-1 rounded-xl border border-gray-800 bg-neutral-950 px-3.5 text-sm outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit" loading={sending} disabled={!text.trim()} className="shrink-0">
            Envoyer
          </Button>
        </div>
        {sendError && <p className="text-sm text-red-400">{sendError}</p>}
      </form>
    </div>
  )
}
