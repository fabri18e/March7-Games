import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 relative overflow-hidden border-r border-border">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 p-8">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">March7 Games</span>
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pb-8">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Juega, comparte,
            <br />
            <span className="text-primary">conecta.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xs">
            La plataforma donde los gamers descubren juegos, comparten sus
            creaciones y construyen comunidad.
          </p>

          <ul className="space-y-3">
            {[
              'Juega directamente en el navegador, sin descargas',
              'Comparte tus creaciones con la comunidad',
              'Sigue a tus creadores favoritos',
              'Descubre juegos independientes únicos',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom decoration */}
        <div className="relative z-10 p-8 pt-0">
          <p className="text-xs text-muted-foreground/50">
            © 2026 March7 Games
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">March7 Games</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
