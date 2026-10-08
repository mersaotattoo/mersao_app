// Vibração tátil (Android/Chrome). No iPhone (Safari) o navegador não permite:
// lá o feedback fica só visual (animação de "batida").
export type HapticKind = 'tap' | 'heartbeat' | 'tattoo' | 'success'

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    if (localStorage.getItem('mersao:haptics') === 'off') return
    navigator.vibrate(pattern)
  } catch {
    /* navegador bloqueou: ignora */
  }
}

export const haptics = {
  /** toque leve */
  tap: () => vibrate(12),
  /** "lub-dub" de coração */
  heartbeat: () => vibrate([16, 70, 26]),
  /** zumbido curto de máquina de tattoo */
  tattoo: () => vibrate([8, 24, 8, 24, 8, 24, 8]),
  /** confirmação */
  success: () => vibrate([20, 60, 20, 60, 44]),
}
