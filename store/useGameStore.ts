import { create } from 'zustand'
import { GameState, Board, Cell, DIFFICULTIES } from '@/lib/minesweeper/types'
import { generateBoard } from '@/lib/minesweeper/generateBoard'
import { floodReveal } from '@/lib/minesweeper/floodReveal'
import { checkWin, checkLoss } from '@/lib/minesweeper/winCheck'

interface GameStore extends GameState {
  // Actions
  startGame: (difficulty: keyof typeof DIFFICULTIES, seed?: number) => void
  revealCell: (x: number, y: number) => void
  toggleFlag: (x: number, y: number) => void
  toggleFlagMode: () => void
  resetGame: () => void
  setFirstClick: (x: number, y: number) => void
}

const createEmptyBoard = (width: number, height: number): Board => ({
  width,
  height,
  cells: Array(height).fill(null).map((_, y) =>
    Array(width).fill(null).map((_, x) => ({
      type: 'empty',
      state: 'hidden',
      count: 0,
      x,
      y,
    }))
  ),
  mineCount: 0,
  revealedCount: 0,
  flaggedCount: 0,
})

export const useGameStore = create<GameStore>((set, get) => ({
  board: createEmptyBoard(10, 8),
  gameStatus: 'playing',
  flagMode: false,
  firstClick: true,
  seed: 0,

  startGame: (difficulty, seed) => {
    const config = DIFFICULTIES[difficulty]
    // Generate a proper random seed on client side
    const gameSeed = seed || Math.floor(Math.random() * 1000000)
    const board = generateBoard(config.width, config.height, config.mineCount, undefined, gameSeed)
    
    set({
      board,
      gameStatus: 'playing',
      flagMode: false,
      firstClick: true,
      seed: gameSeed,
    })
  },

  setFirstClick: (x, y) => {
    const { board, firstClick, seed } = get()
    
    if (!firstClick) return
    
    // Use the current board's dimensions and mine count for first click safety
    // Use the same seed to maintain consistency
    const newBoard = generateBoard(board.width, board.height, board.mineCount, { x, y }, seed)
    
    set({
      board: newBoard,
      firstClick: false,
    })
  },

  revealCell: (x, y) => {
    const { board, gameStatus, flagMode, firstClick } = get()
    
    if (gameStatus !== 'playing') return
    if (flagMode) return
    
    const cell = board.cells[y][x]
    if (cell.state !== 'hidden') return
    
    // Handle first click
    if (firstClick) {
      get().setFirstClick(x, y)
      // After setting first click, reveal the cell
      const { board: newBoard } = get()
      const { revealed, board: updatedBoard } = floodReveal(newBoard, x, y)
      
      set({
        board: updatedBoard,
        firstClick: false,
      })
      
      // Check win/loss after first reveal
      if (checkLoss(updatedBoard)) {
        set({ gameStatus: 'lost' })
      } else if (checkWin(updatedBoard)) {
        set({ gameStatus: 'won' })
      }
      
      return
    }
    
    // Regular reveal
    const { revealed, board: updatedBoard } = floodReveal(board, x, y)
    
    set({ board: updatedBoard })
    
    // Check win/loss
    if (checkLoss(updatedBoard)) {
      set({ gameStatus: 'lost' })
    } else if (checkWin(updatedBoard)) {
      set({ gameStatus: 'won' })
    }
  },

  toggleFlag: (x, y) => {
    const { board, gameStatus, flagMode } = get()
    
    if (gameStatus !== 'playing') return
    if (!flagMode) return
    
    const cell = board.cells[y][x]
    if (cell.state === 'revealed') return
    
    const newBoard = { ...board }
    const newCell = { ...cell }
    
    if (newCell.state === 'hidden') {
      newCell.state = 'flagged'
      newBoard.flaggedCount++
    } else if (newCell.state === 'flagged') {
      newCell.state = 'hidden'
      newBoard.flaggedCount--
    }
    
    newBoard.cells[y][x] = newCell
    
    set({ board: newBoard })
  },

  toggleFlagMode: () => {
    set((state) => ({ flagMode: !state.flagMode }))
  },

  resetGame: () => {
    set({
      board: createEmptyBoard(10, 8),
      gameStatus: 'playing',
      flagMode: false,
      firstClick: true,
      seed: 0,
    })
  },
}))
