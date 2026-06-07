import { cn } from '@/components/ui'

export interface ChatBubbleProps {
  content: string
  /** True when the current user is the sender (right-aligned, yellow-tinted). */
  isOwn: boolean
  /** Epoch milliseconds; rendered as a small HH:MM timestamp. */
  createdAt: number
}

function formatTime(epochMs: number): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(epochMs))
  } catch {
    return ''
  }
}

export function ChatBubble({ content, isOwn, createdAt }: ChatBubbleProps) {
  const time = formatTime(createdAt)

  return (
    <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[78%] flex-col gap-0.5 rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[68%]',
          isOwn
            ? 'bg-brand-yellow/15 text-brand-yellow-soft ring-brand-yellow/25 rounded-br-md ring-1 ring-inset'
            : 'rounded-bl-md bg-neutral-800 text-neutral-100 ring-1 ring-inset ring-gray-800'
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{content}</p>
        {time && (
          <time
            className={cn(
              'self-end text-[10px] tabular-nums',
              isOwn ? 'text-brand-yellow-soft/60' : 'text-neutral-500'
            )}
          >
            {time}
          </time>
        )}
      </div>
    </div>
  )
}
