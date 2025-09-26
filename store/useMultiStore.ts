import { create } from 'zustand'
import { Board, DIFFICULTIES } from '@/lib/minesweeper/types'
import { generateBoard } from '@/lib/minesweeper/generateBoard'
import { floodReveal } from '@/lib/minesweeper/floodReveal'
import { checkWin, checkLoss } from '@/lib/minesweeper/winCheck'

export type Player = 'A' | 'B'
export type GameResult = {
  winner: Player
  reason: 'mine' | 'timeout' | 'allSafe'
}

interface MultiplayerState {
  // Room state
  roomId: string | null
  players: string[]
  currentPlayer: Player | null
  you: Player | null
  turnEndsAt: number | null
  
  // Game state
  board: Board
  gameStatus: 'waiting' | 'playing' | 'finished'
  result: GameResult | null
  
  // UI state
  flagMode: boolean
  
  // Actions
  joinRoom: (roomId: string, players: string[], you: Player, seed: number) => void
  startGame: (seed: number) => void
  makeMove: (x: number, y: number, type: 'reveal' | 'flag') => void
  toggleFlag: (x: number, y: number) => void
  updateGameState: (board: Board, currentPlayer: Player, turnEndsAt: number) => void
  setResult: (result: GameResult) => void
  toggleFlagMode: () => void
  reset: () => void
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

export const useMultiStore = create<MultiplayerState>((set, get) => ({
  roomId: null,
  players: [],
  currentPlayer: null,
  you: null,
  turnEndsAt: null,
  board: createEmptyBoard(18, 16),
  gameStatus: 'waiting',
  result: null,
  flagMode: false,

  joinRoom: (roomId, players, you, seed) => {
    const config = DIFFICULTIES.multi
    const board = generateBoard(config.width, config.height, config.mineCount, undefined, seed)
    
    set({
      roomId,
      players,
      you,
      board,
      gameStatus: 'waiting',
      result: null,
      flagMode: false,
    })
  },

  startGame: (seed) => {
    const config = DIFFICULTIES.multi
    const board = generateBoard(config.width, config.height, config.mineCount, undefined, seed)
    
    set({
      board,
      gameStatus: 'playing',
      result: null,
      currentPlayer: 'A',
      turnEndsAt: Date.now() + 10000, // 10 seconds
    })
  },

  makeMove: (x, y, type) => {
    const { board, gameStatus, currentPlayer, you, flagMode } = get()
    
    if (gameStatus !== 'playing') return
    if (currentPlayer !== you) return // Not your turn
    
    const cell = board.cells[y][x]
    
    if (type === 'reveal') {
      if (cell.state !== 'hidden') return
      
      const { revealed, board: updatedBoard } = floodReveal(board, x, y)
      
      set({ board: updatedBoard })
      
      // Check win/loss
      if (checkLoss(updatedBoard)) {
        set({ 
          gameStatus: 'finished',
          result: { winner: you === 'A' ? 'B' : 'A', reason: 'mine' }
        })
      } else if (checkWin(updatedBoard) && you) {
        set({ 
          gameStatus: 'finished',
          result: { winner: you, reason: 'allSafe' }
        })
      }
    } else if (type === 'flag') {
      if (!flagMode) return
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

  updateGameState: (board, currentPlayer, turnEndsAt) => {
    set({ board, currentPlayer, turnEndsAt })
  },

  setResult: (result) => {
    set({ 
      gameStatus: 'finished',
      result 
    })
  },

  toggleFlagMode: () => {
    set((state) => ({ flagMode: !state.flagMode }))
  },

  reset: () => {
    set({
      roomId: null,
      players: [],
      currentPlayer: null,
      you: null,
      turnEndsAt: null,
      board: createEmptyBoard(18, 16),
      gameStatus: 'waiting',
      result: null,
      flagMode: false,
    })
  },
}))
