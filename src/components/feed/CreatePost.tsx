'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Gamepad2 } from 'lucide-react'
import { createPost } from '@/actions/posts'
import type { Profile } from '@/types/database'

const MAX_CHARS = 400

interface Props {
  profile: Profile
}

const initialState = { error: undefined, success: false }

export function CreatePost({ profile }: Props) {
  const [state, formAction, isPending] = useActionState(createPost, initialState)
  const [content, setContent] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state.success) {
      setContent('')
      formRef.current?.reset()
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }, [state.success])

  const charsLeft = MAX_CHARS - content.length
  const isOverLimit = charsLeft < 0
  const isEmpty = content.trim().length === 0
  const initials = (profile.display_name ?? profile.username).slice(0, 2).toUpperCase()

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">New post</span>
      </div>

      <form ref={formRef} action={formAction}>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0 mt-0.5">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              name="content"
              placeholder="What are you playing? Share your experience..."
              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none outline-none focus:border-primary/50 focus:bg-background transition-colors min-h-[80px] leading-relaxed"
              value={content}
              maxLength={400}
              onChange={(e) => {
                setContent(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              rows={3}
            />

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <div className="flex items-center justify-between">
              <span
                className={`text-xs tabular-nums font-medium ${
                  isOverLimit ? 'text-destructive' : charsLeft <= 50 ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {charsLeft} characters left
              </span>
              <Button
                type="submit"
                size="sm"
                className="rounded-lg font-semibold px-5"
                disabled={isPending || isEmpty || isOverLimit}
              >
                {isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
