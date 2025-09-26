import { Board } from './types'

export function checkWin(board: Board): boolean {
  const { width, height, mineCount } = board
  const totalCells = width * height
  const safeCells = totalCells - mineCount
  
  return board.revealedCount >= safeCells
}

export function checkLoss(board: Board): boolean {
  const { width, height } = board
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = board.cells[y][x]
      if (cell.state === 'revealed' && cell.type === 'mine') {
        return true
      }
    }
  }
  
  return false
}
