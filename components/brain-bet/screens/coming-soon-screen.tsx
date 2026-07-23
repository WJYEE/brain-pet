import type { LucideIcon } from 'lucide-react'

interface ComingSoonScreenProps {
  icon: LucideIcon
  title: string
  message: string
}

/** Generic "준비 중" placeholder used for Ranking and Theme nav tabs. */
export function ComingSoonScreen({ icon: Icon, title, message }: ComingSoonScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-28 pt-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-secondary text-secondary-foreground toy-border toy-shadow">
        <Icon size={30} strokeWidth={2.2} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">{title}</h1>
      <p className="mt-2 max-w-xs whitespace-pre-line text-pretty text-sm text-muted-foreground">
        {message}
      </p>
      <span className="mt-6 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground toy-border">
        Coming Soon
      </span>
    </div>
  )
}
