'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { followUser, unfollowUser } from '@/actions/social'
import { Button } from '@/components/ui/button'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    // Optimistic update — immediately reflect the new state
    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)

    startTransition(async () => {
      const result = wasFollowing
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId)

      if (result.error) {
        setIsFollowing(wasFollowing) // revert on error
        toast.error(result.error)
      }
    })
  }

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className="gap-2 min-w-[116px]"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserMinus className="h-4 w-4" />
        )}
        Siguiendo
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-2 min-w-[116px]"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      Seguir
    </Button>
  )
}
