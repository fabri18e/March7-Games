'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const MAX_CHARS = 200

export function GuestPostPrompt() {
  const router = useRouter()
  const [content, setContent] = useState('')

  const charsLeft = MAX_CHARS - content.length

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">Nueva publicación</span>
      </div>

      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">?</AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-3">
          <textarea
            placeholder="¿Qué estás jugando? Comparte tu experiencia..."
            className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none outline-none focus:border-primary/50 focus:bg-background transition-colors min-h-[80px] leading-relaxed"
            value={content}
            maxLength={MAX_CHARS}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-between">
            <span
              className={`text-xs tabular-nums font-medium ${
                charsLeft <= 50 ? 'text-amber-500' : 'text-muted-foreground'
              }`}
            >
              {charsLeft} caracteres restantes
            </span>
            <Button
              size="sm"
              className="rounded-lg font-semibold px-5"
              onClick={() => router.push('/register')}
            >
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
