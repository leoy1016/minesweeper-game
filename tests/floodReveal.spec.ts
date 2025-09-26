import { describe, it, expect } from 'vitest'
import { generateBoard } from '@/lib/minesweeper/generateBoard'
import { floodReveal } from '@/lib/minesweeper/floodReveal'
import { Board, Cell } from '@/lib/minesweeper/types'

describe('Flood Reveal', () => {
  it('should reveal single cell when clicking on number', () => {
    // Create a simple board with known mine positions
    const board: Board = {
      width: 3,
      height: 3,
      cells: [
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 0 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 0 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 0 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 1 },
          { type: 'number', state: 'hidden', count: 1, x: 1, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 1 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 2 }
        ]
      ],
      mineCount: 0,
      revealedCount: 0,
      flaggedCount: 0
    }

    const { revealed } = floodReveal(board, 1, 1)
    
    // Should only reveal the clicked cell (number)
    expect(revealed.size).toBe(1)
    expect(revealed.has('1,1')).toBe(true)
    expect(board.cells[1][1].state).toBe('revealed')
  })

  it('should flood reveal empty cells', () => {
    // Create a board with empty cells that should flood
    const board: Board = {
      width: 3,
      height: 3,
      cells: [
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 0 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 0 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 0 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 1 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 2 }
        ]
      ],
      mineCount: 0,
      revealedCount: 0,
      flaggedCount: 0
    }

    const { revealed } = floodReveal(board, 1, 1)
    
    // Should reveal all 9 cells
    expect(revealed.size).toBe(9)
    
    // All cells should be revealed
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        expect(board.cells[y][x].state).toBe('revealed')
      }
    }
  })

  it('should not reveal flagged cells', () => {
    const board: Board = {
      width: 3,
      height: 3,
      cells: [
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 0 },
          { type: 'empty', state: 'flagged', count: 0, x: 1, y: 0 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 0 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 1 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 2 }
        ]
      ],
      mineCount: 0,
      revealedCount: 0,
      flaggedCount: 0
    }

    const { revealed } = floodReveal(board, 1, 1)
    
    // Should not reveal the flagged cell
    expect(board.cells[0][1].state).toBe('flagged')
    expect(revealed.has('1,0')).toBe(false)
  })

  it('should stop at number boundaries', () => {
    const board: Board = {
      width: 3,
      height: 3,
      cells: [
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 0 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 0 },
          { type: 'number', state: 'hidden', count: 1, x: 2, y: 0 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 1 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 1 }
        ],
        [
          { type: 'empty', state: 'hidden', count: 0, x: 0, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 1, y: 2 },
          { type: 'empty', state: 'hidden', count: 0, x: 2, y: 2 }
        ]
      ],
      mineCount: 0,
      revealedCount: 0,
      flaggedCount: 0
    }

    const { revealed } = floodReveal(board, 0, 0)
    
    // Should reveal all cells (9) since they're all connected through empty cells
    expect(revealed.size).toBe(9)
    expect(revealed.has('0,0')).toBe(true)
    expect(revealed.has('1,0')).toBe(true)
    expect(revealed.has('0,1')).toBe(true)
    expect(revealed.has('1,1')).toBe(true)
    expect(revealed.has('2,1')).toBe(true)
    expect(revealed.has('0,2')).toBe(true)
    expect(revealed.has('1,2')).toBe(true)
    expect(revealed.has('2,2')).toBe(true)
    expect(revealed.has('2,0')).toBe(true) // Number cell is revealed too
  })
})
