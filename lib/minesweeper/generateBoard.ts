import { Board, Cell } from './types'
import { RNG } from './rng'

export function generateBoard(
  width: number,
  height: number,
  mineCount: number,
  firstClick?: { x: number; y: number },
  seed?: number
): Board {
  const rng = new RNG(seed || 12345) // Use fixed seed for SSR compatibility
  
  // Initialize empty board
  const cells: Cell[][] = []
  for (let y = 0; y < height; y++) {
    cells[y] = []
    for (let x = 0; x < width; x++) {
      cells[y][x] = {
        type: 'empty',
        state: 'hidden',
        count: 0,
        x,
        y,
      }
    }
  }

  // If first click is provided, ensure it and its neighbors are safe
  let minePositions: { x: number; y: number }[] = []
  
  if (firstClick) {
    // Get all positions except first click and its neighbors
    const safePositions: { x: number; y: number }[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isFirstClick = x === firstClick.x && y === firstClick.y
        const isNeighbor = Math.abs(x - firstClick.x) <= 1 && Math.abs(y - firstClick.y) <= 1
        
        if (!isFirstClick && !isNeighbor) {
          safePositions.push({ x, y })
        }
      }
    }
    
    // Shuffle safe positions and take mineCount mines
    const shuffled = rng.shuffle([...safePositions])
    minePositions = shuffled.slice(0, mineCount)
  } else {
    // Random mine placement
    const allPositions: { x: number; y: number }[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        allPositions.push({ x, y })
      }
    }
    
    const shuffled = rng.shuffle([...allPositions])
    minePositions = shuffled.slice(0, mineCount)
  }

  // Place mines
  minePositions.forEach(({ x, y }) => {
    cells[y][x].type = 'mine'
  })

  // Calculate adjacent mine counts
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cells[y][x].type !== 'mine') {
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
              cells[ny][nx].type === 'mine'
            ) {
              count++
            }
          }
        }
        cells[y][x].count = count
        cells[y][x].type = count > 0 ? 'number' : 'empty'
      }
    }
  }

  return {
    width,
    height,
    cells,
    mineCount,
    revealedCount: 0,
    flaggedCount: 0,
  }
}
