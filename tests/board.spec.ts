import { describe, it, expect } from 'vitest'
import { generateBoard } from '@/lib/minesweeper/generateBoard'
import { countAdjacentMines } from '@/lib/minesweeper/counts'

describe('Board Generation', () => {
  it('should generate board with correct dimensions', () => {
    const board = generateBoard(10, 8, 10)
    
    expect(board.width).toBe(10)
    expect(board.height).toBe(8)
    expect(board.cells).toHaveLength(8)
    expect(board.cells[0]).toHaveLength(10)
  })

  it('should place correct number of mines', () => {
    const board = generateBoard(10, 8, 10)
    
    let mineCount = 0
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 10; x++) {
        if (board.cells[y][x].type === 'mine') {
          mineCount++
        }
      }
    }
    
    expect(mineCount).toBe(10)
  })

  it('should calculate correct adjacent mine counts', () => {
    const board = generateBoard(10, 8, 10)
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = board.cells[y][x]
        if (cell.type !== 'mine') {
          const actualCount = countAdjacentMines(board, x, y)
          expect(cell.count).toBe(actualCount)
        }
      }
    }
  })

  it('should set correct cell types based on mine count', () => {
    const board = generateBoard(10, 8, 10)
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = board.cells[y][x]
        
        if (cell.type === 'mine') {
          expect(cell.count).toBe(0) // Mines don't count themselves
        } else if (cell.count === 0) {
          expect(cell.type).toBe('empty')
        } else {
          expect(cell.type).toBe('number')
          expect(cell.count).toBeGreaterThan(0)
          expect(cell.count).toBeLessThanOrEqual(8)
        }
      }
    }
  })

  it('should generate different boards with different seeds', () => {
    const board1 = generateBoard(10, 8, 10, undefined, 123)
    const board2 = generateBoard(10, 8, 10, undefined, 456)
    
    // Boards should be different (very high probability)
    let different = false
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 10; x++) {
        if (board1.cells[y][x].type !== board2.cells[y][x].type) {
          different = true
          break
        }
      }
      if (different) break
    }
    
    expect(different).toBe(true)
  })
})
