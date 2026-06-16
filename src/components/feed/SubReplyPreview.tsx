'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getCommentReplies } from '@/actions/posts'

interface Props {
  commentId: string
  replyCount: number
}

export function SubReplyPreview({ commentId, replyCount }: Props) {
  const [last, setLast] = useState<{
    profiles: { username: string; display_name: string | null; avatar_url: string | null }
    content: string
  } | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getCommentReplies(commentId)
      if (!data.length) return
      const best = data.reduce((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count > a.like_count ? b : a
        return new Date(b.created_at) >= new Date(a.created_at) ? b : a
      })
      setLast(best as typeof last)
    })
  }, [commentId])

  if (!last) return null

  const initials = (last.profiles.display_name ?? last.profiles.username).slice(0, 2).toUpperCase()
  const extra = replyCount - 1

  return (
    <Link
      href={`/reply/${commentId}`}
      className="flex items-center gap-3 py-2 pl-12 border-b border-border/50 group/rpreview"
    >
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage src={last.profiles.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">{initials}</AvatarFallback>
      </Avatar>
      <p className="text-xs text-muted-foreground min-w-0 truncate flex-1 group-hover/rpreview:text-foreground transition-colors">
        <span className="font-semibold text-foreground/70 mr-1.5">{last.profiles.display_name ?? last.profiles.username}</span>
        {last.content}
      </p>
      {extra > 0 && (
        <span className="text-xs text-violet-400 hover:text-violet-300 shrink-0 transition-colors">See {extra} more →</span>
      )}
    </Link>
  )
}
