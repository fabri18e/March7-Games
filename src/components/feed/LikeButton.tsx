'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/actions/posts'

interface Props {
  postId: string
  initialLiked: boolean
  initialCount: number
  onToggle?: (id: string) => Promise<void>
}

export function LikeButton({ postId, initialLiked, initialCount, onToggle }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))

    startTransition(async () => {
      try {
        await (onToggle ? onToggle(postId) : toggleLike(postId))
      } catch {
        setLiked(wasLiked)
        setCount((c) => (wasLiked ? c + 1 : c - 1))
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`group flex items-center gap-1.5 text-sm rounded-full px-2 py-1 -ml-2 transition-colors hover:text-red-500 hover:bg-red-500/10 ${
        liked ? 'text-red-500' : 'text-muted-foreground'
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
          liked ? 'fill-current' : ''
        }`}
      />
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
