import { Board } from './types'

export function floodReveal(
  board: Board,
  startX: number,
  startY: number
): { revealed: Set<string>; board: Board } {
  const { width, height } = board
  const revealed = new Set<string>()
  const queue: { x: number; y: number }[] = []
  
  // Check bounds
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return { revealed, board }
  }
  
  // Check if cell is already revealed or flagged
  const cell = board.cells[startY][startX]
  if (cell.state === 'revealed' || cell.state === 'flagged') {
    return { revealed, board }
  }
  
  // If it's a mine, just reveal it and return
  if (cell.type === 'mine') {
    cell.state = 'revealed'
    board.revealedCount++
    revealed.add(`${startX},${startY}`)
    return { revealed, board }
  }
  
  // Start flood fill
  queue.push({ x: startX, y: startY })
  
  while (queue.length > 0) {
    const { x, y } = queue.shift()!
    const cellKey = `${x},${y}`
    
    if (revealed.has(cellKey)) continue
    
    const currentCell = board.cells[y][x]
    
    // Skip if already revealed, flagged, or is a mine
    if (currentCell.state === 'revealed' || currentCell.state === 'flagged' || currentCell.type === 'mine') {
      continue
    }
    
    // Reveal this cell
    currentCell.state = 'revealed'
    board.revealedCount++
    revealed.add(cellKey)
    
    // If it's an empty cell (count = 0), add neighbors to queue
    if (currentCell.type === 'empty' && currentCell.count === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          
          if (
            nx >= 0 &&
            nx < width &&
            ny >= 0 &&
            ny < height &&
            !revealed.has(`${nx},${ny}`)
          ) {
            queue.push({ x: nx, y: ny })
          }
        }
      }
    }
  }
  
  return { revealed, board }
}
