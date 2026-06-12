'use client'

import { useState } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

interface Props {
  children: React.ReactNode
  sidebar: React.ReactNode
}

export function FeedWithSidebar({ children, sidebar }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex w-full">
      {/* Feed column */}
      <div className="flex-1 border-r border-border min-h-screen min-w-0">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-xl">Inicio</h1>
          <button
            onClick={() => setOpen((v) => !v)}
            title={open ? 'Ocultar panel' : 'Mostrar panel'}
            className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-accent transition-colors"
          >
            {open ? (
              <>
                <PanelRightClose className="h-3.5 w-3.5" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="h-3.5 w-3.5" />
                <span>Panel</span>
              </>
            )}
          </button>
        </div>

        {children}
      </div>

      {/* Collapsible right sidebar */}
      <aside
        className={`hidden md:flex flex-col gap-4 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'w-[280px] px-3 py-4 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div className="w-[256px]">{sidebar}</div>
      </aside>
    </div>
  )
}
