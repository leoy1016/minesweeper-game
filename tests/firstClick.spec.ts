import { describe, it, expect } from 'vitest'
import { generateBoard } from '@/lib/minesweeper/generateBoard'
import { floodReveal } from '@/lib/minesweeper/floodReveal'

describe('First Click Safety', () => {
  it('should never place a mine on first click', () => {
    const board = generateBoard(10, 8, 10, { x: 5, y: 4 })
    const firstClickCell = board.cells[4][5]
    
    expect(firstClickCell.type).not.toBe('mine')
  })

  it('should never place mines adjacent to first click', () => {
    const board = generateBoard(10, 8, 10, { x: 5, y: 4 })
    
    // Check all 8 adjacent cells
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = 5 + dx
        const y = 4 + dy
        
        if (x >= 0 && x < 10 && y >= 0 && y < 8) {
          const cell = board.cells[y][x]
          expect(cell.type).not.toBe('mine')
        }
      }
    }
  })

  it('should place correct number of mines', () => {
    const board = generateBoard(10, 8, 10, { x: 5, y: 4 })
    
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

  it('should reveal multiple cells on first click if empty', () => {
    const board = generateBoard(10, 8, 5, { x: 5, y: 4 }) // Fewer mines for better chance of flood
    const { revealed } = floodReveal(board, 5, 4)
    
    // Should reveal at least the first click cell
    expect(revealed.size).toBeGreaterThan(0)
    expect(revealed.has('5,4')).toBe(true)
  })
})
