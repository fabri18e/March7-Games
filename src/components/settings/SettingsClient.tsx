'use client'

import { useState, useActionState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Lock, Trash2, Camera, CheckCircle2, AlertTriangle, Palette, LogIn, Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { updateProfile, uploadAvatar } from '@/actions/profiles'
import { changePassword, deleteAccount } from '@/actions/account'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

type Tab = 'appearance' | 'profile' | 'account' | 'danger'

const TABS: { key: Tab; label: string; icon: React.ElementType; requiresAuth: boolean }[] = [
  { key: 'appearance', label: 'Apariencia', icon: Palette, requiresAuth: false },
  { key: 'profile',    label: 'Perfil',     icon: UserIcon, requiresAuth: true  },
  { key: 'account',   label: 'Cuenta',     icon: Lock,     requiresAuth: true  },
  { key: 'danger',    label: 'Peligro',    icon: Trash2,   requiresAuth: true  },
]

interface Props {
  user: User | null
  profile: Profile | null
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
      <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" /> {message}
    </div>
  )
}

function LoginPrompt() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <LogIn className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-semibold">Inicia sesión para continuar</p>
        <p className="text-sm text-muted-foreground mt-1">Esta sección requiere una cuenta</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/login')}>Iniciar sesión</Button>
        <Button size="sm" onClick={() => router.push('/register')}>Registrarse</Button>
      </div>
    </div>
  )
}

function AppearanceSection() {
  const [lang, setLang] = useState('es')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold">Apariencia</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Personaliza cómo se ve la app</p>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tema</label>
        <div className="flex gap-2">
          {([['dark', 'Oscuro', Moon], ['light', 'Claro', Sun]] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              disabled={value === 'light'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                value === 'dark'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {value === 'light' && <span className="text-[10px] ml-1">· pronto</span>}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* Language */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Idioma</label>
        <div className="flex gap-2">
          {([['es', 'Español'], ['en', 'English']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setLang(value)}
              disabled={value === 'en'}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                lang === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : value === 'en'
                  ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {value === 'en' && <span className="ml-1 text-[10px]">· pronto</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ profile }: { profile: Profile | null }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, {})
  const [avatarState, setAvatarState] = useState<{ error?: string; success?: boolean }>({})
  const [avatarPending, setAvatarPending] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = (profile?.display_name ?? profile?.username ?? '?').slice(0, 2).toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setAvatarPending(true)
    const fd = new FormData()
    fd.append('avatar', file)
    const result = await uploadAvatar(fd)
    setAvatarState(result)
    setAvatarPending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold">Perfil público</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Así te ven los demás jugadores</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src={preview ?? profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarPending}
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5 text-primary-foreground" />
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-medium">Avatar</p>
          <p className="text-xs text-muted-foreground">JPG, PNG o WEBP · Máx 2MB</p>
          {avatarState.error && <p className="text-xs text-destructive mt-1">{avatarState.error}</p>}
          {avatarState.success && <p className="text-xs text-emerald-400 mt-1">Avatar actualizado</p>}
        </div>
      </div>

      <form action={profileAction} className="space-y-4">
        {profileState.success && <SuccessBanner message="Perfil actualizado correctamente" />}
        {profileState.error && <ErrorBanner message={profileState.error} />}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Username</label>
          <input name="username" defaultValue={profile?.username ?? ''} placeholder="tu_username"
            className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 focus:bg-background transition-colors" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nombre visible</label>
          <input name="display_name" defaultValue={profile?.display_name ?? ''} placeholder="Tu nombre" maxLength={50}
            className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 focus:bg-background transition-colors" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Bio</label>
          <textarea name="bio" defaultValue={profile?.bio ?? ''} placeholder="Cuéntanos algo sobre ti..." maxLength={300} rows={3}
            className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-primary/50 focus:bg-background transition-colors" />
        </div>

        <Button type="submit" disabled={profilePending} size="sm" className="font-semibold">
          {profilePending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  )
}

function AccountSection({ user }: { user: User }) {
  const [state, action, isPending] = useActionState(changePassword, {})

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold">Cuenta</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Gestiona tu email y contraseña</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <input value={user.email ?? ''} disabled
          className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
        <p className="text-xs text-muted-foreground">El email no se puede cambiar por ahora</p>
      </div>

      <hr className="border-border" />

      <div>
        <h3 className="text-sm font-bold mb-4">Cambiar contraseña</h3>
        <form action={action} className="space-y-4">
          {state.success && <SuccessBanner message="Contraseña actualizada correctamente" />}
          {state.error && <ErrorBanner message={state.error} />}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nueva contraseña</label>
            <input name="password" type="password" placeholder="••••••••"
              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 focus:bg-background transition-colors" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirmar contraseña</label>
            <input name="confirmPassword" type="password" placeholder="••••••••"
              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 focus:bg-background transition-colors" />
          </div>

          <Button type="submit" disabled={isPending} size="sm" className="font-semibold">
            {isPending ? 'Actualizando...' : 'Cambiar contraseña'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function DangerSection() {
  const [confirm, setConfirm] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (confirm !== 'eliminar') return
    setPending(true)
    const result = await deleteAccount()
    if (result?.error) { setError(result.error); setPending(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold">Zona de peligro</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Acciones irreversibles para tu cuenta</p>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Trash2 className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Eliminar cuenta</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Se eliminarán permanentemente tu perfil, publicaciones y todos tus datos. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Escribe <span className="font-mono font-bold text-foreground">eliminar</span> para confirmar
          </label>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="eliminar"
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-destructive/50 transition-colors" />
        </div>

        <Button variant="destructive" size="sm" disabled={confirm !== 'eliminar' || pending} onClick={handleDelete} className="font-semibold">
          {pending ? 'Eliminando...' : 'Eliminar mi cuenta'}
        </Button>
      </div>
    </div>
  )
}

export function SettingsClient({ user, profile }: Props) {
  const [tab, setTab] = useState<Tab>('appearance')

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Ajustes</h1>

      <div className="flex gap-6">
        {/* Left nav */}
        <nav className="flex flex-col gap-1 w-44 shrink-0">
          {TABS.filter(({ requiresAuth }) => !requiresAuth || !!user).map(({ key, label, icon: Icon, requiresAuth }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                tab === key
                  ? key === 'danger'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-primary/10 text-primary'
                  : key === 'danger'
                  ? 'text-destructive/70 hover:text-destructive hover:bg-destructive/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              } ${key === 'danger' ? 'mt-4' : ''}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-card border border-border rounded-xl p-6">
          {tab === 'appearance' && <AppearanceSection />}
          {tab === 'profile'    && (user ? <ProfileSection profile={profile} /> : <LoginPrompt />)}
          {tab === 'account'   && (user ? <AccountSection user={user} /> : <LoginPrompt />)}
          {tab === 'danger'    && (user ? <DangerSection /> : <LoginPrompt />)}
        </div>
      </div>
    </div>
  )
}
