import { cn } from '@/lib/utils'

interface GameRuleReminderProps {
  text: string
  className?: string
}

/**
 * One-line rule reminder styled like the Tutorial's orange rule callouts —
 * kept visible for the whole Tutorial + Real session (not just Tutorial) so
 * the rule can be re-checked anytime without disrupting the game layout.
 * Shared by every mini-game with a custom (non-GameHud) header so the
 * always-visible orange reminder reads as one consistent system across all
 * 12 games (GameHud's own `objective` line covers the other 6 the same way).
 */
export function GameRuleReminder({ text, className }: GameRuleReminderProps) {
  return <p className={cn('text-pretty text-center text-[10px] font-semibold text-primary', className)}>{text}</p>
}
