import { Cutive_Mono } from 'next/font/google'

export const cutiveMono = Cutive_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-cutive-mono',
})

export const theme = {
  colors: {
    easy: 'hsl(120 30% 45%)',
    medium: 'hsl(210 35% 45%)',
    hard: 'hsl(0 35% 45%)',
    multi: 'hsl(50 35% 45%)',
    mineFlash: 'hsl(0 80% 40%)', // High saturation dark red for mine flash
    numbers: {
      1: 'hsl(60 60% 50%)',   // yellow
      2: 'hsl(30 60% 50%)',   // orange
      3: 'hsl(0 35% 45%)',    // red (low sat)
      4: 'hsl(270 50% 50%)',  // purple
      5: 'hsl(210 60% 50%)',  // blue
      6: 'hsl(330 60% 50%)',  // pink
    },
    safe: 'hsl(120 30% 45%)', // green
    background: '#000000',
    text: '#EDEDED',
  },
} as const
