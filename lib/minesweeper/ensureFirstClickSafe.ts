import { Board } from './types'

export function ensureFirstClickSafe(
  board: Board,
  firstClickX: number,
  firstClickY: number
): Board {
  // This function is called after the first click to ensure the first click
  // and its neighbors are safe. Since we already handle this in generateBoard,
  // this is mainly for additional safety checks.
  
  const { width, height } = board
  
  // Check if first click is within bounds
  if (firstClickX < 0 || firstClickX >= width || firstClickY < 0 || firstClickY >= height) {
    return board
  }
  
  // Ensure first click cell is not a mine
  if (board.cells[firstClickY][firstClickX].type === 'mine') {
    // Find a safe cell to swap with
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isFirstClick = x === firstClickX && y === firstClickY
        const isNeighbor = Math.abs(x - firstClickX) <= 1 && Math.abs(y - firstClickY) <= 1
        
        if (!isFirstClick && !isNeighbor && board.cells[y][x].type !== 'mine') {
          // Swap mine positions
          const temp = board.cells[firstClickY][firstClickX]
          board.cells[firstClickY][firstClickX] = board.cells[y][x]
          board.cells[y][x] = temp
          
          // Recalculate counts
          return recalculateCounts(board)
        }
      }
    }
  }
  
  return board
}

function recalculateCounts(board: Board): Board {
  const { width, height } = board
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (board.cells[y][x].type !== 'mine') {
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
        board.cells[y][x].count = count
        board.cells[y][x].type = count > 0 ? 'number' : 'empty'
      }
    }
  }
  
  return board
}
