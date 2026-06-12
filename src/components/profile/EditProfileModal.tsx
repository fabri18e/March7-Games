'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types/database'
import { updateProfile, uploadAvatar } from '@/actions/profiles'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </Button>
  )
}

export function EditProfileModal({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState(updateProfile, undefined)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploading, startUpload] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const handledStateRef = useRef(state)

  // Close dialog and navigate on success
  useEffect(() => {
    if (state?.success && state !== handledStateRef.current) {
      handledStateRef.current = state
      setOpen(false)
      toast.success('Perfil actualizado correctamente')
      if (state.username && state.username !== profile.username) {
        router.push(`/profile/${state.username}`)
      } else {
        router.refresh()
      }
    }
  }, [state, profile.username, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WEBP')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 2MB')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    const formData = new FormData()
    formData.append('avatar', file)

    startUpload(async () => {
      const result = await uploadAvatar(formData)
      if (result.error) {
        toast.error(result.error)
        setAvatarPreview(null)
      } else {
        toast.success('Avatar actualizado')
      }
    })
  }

  const initials = (profile.username ?? '?').slice(0, 2).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2" />
        }
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar perfil
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        {/* Avatar section */}
        <div className="flex justify-center pt-2 pb-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            title="Cambiar foto de perfil"
          >
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage
                src={avatarPreview ?? profile.avatar_url ?? undefined}
                alt={profile.username}
              />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Profile form */}
        <form action={action} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              name="username"
              defaultValue={profile.username}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-display-name">
              Nombre visible{' '}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input
              id="edit-display-name"
              name="display_name"
              defaultValue={profile.display_name ?? ''}
              maxLength={50}
              placeholder="Tu nombre visible"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bio">
              Biografía{' '}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Textarea
              id="edit-bio"
              name="bio"
              defaultValue={profile.bio ?? ''}
              maxLength={300}
              placeholder="Cuéntanos algo sobre ti..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border -mx-4 -mb-4 px-4 pb-4 bg-muted/30 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SaveButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
