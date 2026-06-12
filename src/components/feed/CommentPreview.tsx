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
      const last = data[data.length - 1]
      if (last) setComment(last as typeof comment)
    })
  }, [postId])

  if (!comment) return null

  const initials = (comment.profiles.display_name ?? comment.profiles.username).slice(0, 2).toUpperCase()
  const extraCount = commentCount - 1

  return (
    <Link href={`/post/${postId}`} className="block mt-2 pt-2 border-t border-border/40 group/preview">
      <div className="flex items-center gap-2">
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs text-muted-foreground min-w-0 truncate group-hover/preview:text-foreground transition-colors">
          <span className="font-semibold text-foreground/70">{comment.profiles.display_name ?? comment.profiles.username}</span>
          {' '}
          {comment.content}
        </p>
      </div>
      {extraCount > 0 && (
        <p className="text-xs text-primary mt-1 pl-7">
          Ver {extraCount} respuesta{extraCount !== 1 ? 's' : ''} más
        </p>
      )}
    </Link>
  )
}
