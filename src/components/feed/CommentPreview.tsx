'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getComments } from '@/actions/posts'

interface Props {
  postId: string
  commentCount: number
}

export function CommentPreview({ postId, commentCount }: Props) {
  const [comment, setComment] = useState<{
    profiles: { username: string; display_name: string | null; avatar_url: string | null }
    content: string
  } | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getComments(postId)
      // Only comments directly on the post (not sub-replies)
      const direct = data.filter(c => !c.parent_id)
      if (!direct.length) return
      // The one with the most likes; if tied, the most recent
      const best = direct.reduce((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count > a.like_count ? b : a
        return new Date(b.created_at) >= new Date(a.created_at) ? b : a
      })
      setComment(best as typeof comment)
    })
  }, [postId])

  if (!comment) return null

  const initials = (comment.profiles.display_name ?? comment.profiles.username).slice(0, 2).toUpperCase()
  const extraCount = commentCount - 1

  return (
    <Link href={`/post/${postId}`} className="flex items-center gap-3 mt-2 pt-2 border-t border-border/40 group/preview">
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
        <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs text-muted-foreground min-w-0 truncate flex-1 group-hover/preview:text-foreground transition-colors">
        <span className="font-semibold text-foreground/70 mr-1.5">{comment.profiles.display_name ?? comment.profiles.username}</span>
        {comment.content}
      </p>
      {extraCount > 0 && (
        <span className="text-xs text-violet-400 hover:text-violet-300 shrink-0 ml-2 transition-colors">See {extraCount} more →</span>
      )}
    </Link>
  )
}
