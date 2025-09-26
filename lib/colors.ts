export const colors = {
  easy: 'hsl(120 30% 45%)',
  medium: 'hsl(210 35% 45%)',
  hard: 'hsl(0 35% 45%)',
  multi: 'hsl(50 35% 45%)',
  mineFlash: 'hsl(0 80% 40%)',
  safe: 'hsl(120 30% 45%)',
  background: '#000000',
  text: '#EDEDED',
  numbers: {
    1: 'hsl(60 60% 50%)',
    2: 'hsl(30 60% 50%)',
    3: 'hsl(0 35% 45%)',
    4: 'hsl(270 50% 50%)',
    5: 'hsl(210 60% 50%)',
    6: 'hsl(330 60% 50%)',
  },
} as const

export const getNumberColor = (count: number): string => {
  if (count >= 1 && count <= 6) {
    return colors.numbers[count as keyof typeof colors.numbers]
  }
  return colors.text
}
