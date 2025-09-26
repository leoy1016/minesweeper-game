export type CellState = 'hidden' | 'revealed' | 'flagged'
export type CellType = 'empty' | 'mine' | 'number'

export interface Cell {
  type: CellType
  state: CellState
  count: number // Adjacent mine count (0 for empty, 1-8 for numbers)
  x: number
  y: number
}

export interface Board {
  width: number
  height: number
  cells: Cell[][]
  mineCount: number
  revealedCount: number
  flaggedCount: number
}

export interface GameState {
  board: Board
  gameStatus: 'playing' | 'won' | 'lost'
  flagMode: boolean
  firstClick: boolean
}

export interface Difficulty {
  name: string
  width: number
  height: number
  mineCount: number
  color: string
}

export const DIFFICULTIES: Record<string, Difficulty> = {
  easy: {
    name: 'Easy',
    width: 10,
    height: 8,
    mineCount: 10,
    color: 'var(--easy)',
  },
  medium: {
    name: 'Medium',
    width: 18,
    height: 16,
    mineCount: 40,
    color: 'var(--medium)',
  },
  hard: {
    name: 'Hard',
    width: 24,
    height: 20,
    mineCount: 90,
    color: 'var(--hard)',
  },
  multi: {
    name: 'Multiplayer',
    width: 18,
    height: 16,
    mineCount: 40,
    color: 'var(--multi)',
  },
}
