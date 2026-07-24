/**
 * 0-6 growth-stage captions shown between First Play games (CompleteScreen)
 * and reused as the basis for EggScreen's final Hatch sequence. Stage 0
 * ("아직 조용한 상태") is never actually rendered by CompleteScreen (it only
 * ever shows index+1, i.e. 1-6) — kept here for completeness/documentation
 * and in case a future "before Game 1" moment wants it.
 */
export const EGG_STAGE_MESSAGE: Record<number, string> = {
  0: '조금 설레는 기분이에요... 어떤 친구가 태어날까요?',
  1: '어라? 작은 움직임이 느껴졌어요',
  2: 'Statling이 당신을 조금씩 알아가고 있어요.',
  3: '알이 조금 흔들리고 있어요. 무언가 깨어나려는 걸까요?',
  4: '안에서 작은 소리가 들려요...',
  5: '강하게 움직이고 있어요! 곧 만날 수 있을 것 같아요.',
  6: '이제 곧 태어날 준비가 됐어요!',
}

/**
 * Per-stage one-shot entrance motion for the Egg growth teaser (CompleteScreen)
 * — CSS animation class only (see app/globals.css's animate-egg-stage-N), never
 * touching the underlying PNG. Intensity/decoration escalates with stage:
 * stage 1 barely flinches, stage 6 is the strongest wobble+glow+sparkle combo
 * right before Hatch. `sparkles` is how many `animate-sparkle-burst` spans to
 * render around the egg; `ring`/`glow` gate the stage-4 impact ring and the
 * stage-5/6 glow pulse respectively.
 */
export interface EggStageMotion {
  animationClass: string
  sparkles: number
  ring: boolean
  glow: boolean
}

export const EGG_STAGE_MOTION: Record<number, EggStageMotion> = {
  1: { animationClass: 'animate-egg-stage-1', sparkles: 0, ring: false, glow: false },
  2: { animationClass: 'animate-egg-stage-2', sparkles: 1, ring: false, glow: false },
  3: { animationClass: 'animate-egg-stage-3', sparkles: 0, ring: false, glow: false },
  4: { animationClass: 'animate-egg-stage-4', sparkles: 1, ring: true, glow: false },
  5: { animationClass: 'animate-egg-stage-5', sparkles: 2, ring: false, glow: true },
  6: { animationClass: 'animate-egg-stage-6', sparkles: 3, ring: false, glow: true },
}
