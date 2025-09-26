import { Board } from './types'

export function countAdjacentMines(board: Board, x: number, y: number): number {
  const { width, height } = board
  let count = 0
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const ny = y + dy
      
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        board.cells[ny][nx].type === 'mine'
      ) {
        count++
      }
    }
  }
  
  return count
}

export function updateCounts(board: Board): Board {
  const { width, height } = board
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (board.cells[y][x].type !== 'mine') {
        const count = countAdjacentMines(board, x, y)
        board.cells[y][x].count = count
        board.cells[y][x].type = count > 0 ? 'number' : 'empty'
      }
    }
  }
  
  return board
}
