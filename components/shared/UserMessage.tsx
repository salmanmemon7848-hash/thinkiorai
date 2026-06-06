import { cn } from '@/lib/utils/cn'

interface UserMessageProps {
  content: string
  className?: string
}

export default function UserMessage({ content, className }: UserMessageProps) {
  return (
    <div className={cn('flex justify-end', className)}>
      <div className="max-w-[80%] bg-bg-elevated border border-line rounded-2xl rounded-tr-sm px-4 py-3 text-[14.5px] text-fg leading-relaxed">
        {content}
      </div>
    </div>
  )
}
