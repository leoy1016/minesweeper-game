'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useMultiStore } from '@/store/useMultiStore'
import { getNumberColor } from '@/lib/colors'
import { Cell } from '@/lib/minesweeper/types'

interface BoardCanvasProps {
  isMultiplayer?: boolean
}

export default function BoardCanvas({ isMultiplayer = false }: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  
  const gameStore = useGameStore()
  const multiStore = useMultiStore()
  
  const { board, flagMode, gameStatus } = isMultiplayer ? multiStore : gameStore

  // Animation state
  const [spawnedRows, setSpawnedRows] = useState(0)
  const [isExploding, setIsExploding] = useState(false)
  const [explosionProgress, setExplosionProgress] = useState(0)

  // Calculate fullscreen dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Calculate board size to take up middle 50% of screen with margins
  const maxBoardWidth = dimensions.width * 0.5  // 50% of screen width
  const maxBoardHeight = dimensions.height * 0.5  // 50% of screen height
  
  const DOT_SIZE = Math.min(
    maxBoardWidth / board.width / 2,  // Divide by 2 for spacing
    maxBoardHeight / board.height / 2
  )
  const DOT_SPACING = DOT_SIZE * 2
  const CANVAS_PADDING = DOT_SIZE
  
  const canvasWidth = board.width * DOT_SPACING + CANVAS_PADDING * 2
  const canvasHeight = board.height * DOT_SPACING + CANVAS_PADDING * 2

  // Spawn animation
  useEffect(() => {
    if (spawnedRows < board.height) {
      const timer = setTimeout(() => {
        setSpawnedRows(prev => prev + 1)
      }, 50) // 50ms per row
      
      return () => clearTimeout(timer)
    }
  }, [spawnedRows, board.height])

  // Reset spawn animation when board changes
  useEffect(() => {
    setSpawnedRows(0)
    setIsExploding(false)
    setExplosionProgress(0)
  }, [board.width, board.height])

  // Check for mine explosion
  useEffect(() => {
    if (gameStatus === 'lost' && !isExploding) {
      setIsExploding(true)
      // Animate explosion over 1 second
      const startTime = Date.now()
      const duration = 1000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setExplosionProgress(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [gameStatus, isExploding])

  const drawCell = useCallback((
    ctx: CanvasRenderingContext2D,
    cell: Cell,
    x: number,
    y: number,
    alpha: number = 1
  ) => {
    const centerX = CANVAS_PADDING + x * DOT_SPACING + DOT_SPACING / 2
    const centerY = CANVAS_PADDING + y * DOT_SPACING + DOT_SPACING / 2

    ctx.save()
    ctx.globalAlpha = alpha
    
    if (isExploding) {
      // During explosion, all dots turn red gradually
      const redIntensity = explosionProgress
      ctx.fillStyle = `rgba(255, 0, 0, ${redIntensity})`
      ctx.beginPath()
      ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (cell.state === 'hidden') {
      // White dot for hidden cells
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (cell.state === 'flagged') {
      // Red dot for flagged cells
      ctx.fillStyle = '#FF0000'
      ctx.beginPath()
      ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (cell.state === 'revealed') {
      if (cell.type === 'mine') {
        // Black dot for mines
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (cell.type === 'number') {
        // Number with color - proportionally sized
        ctx.fillStyle = getNumberColor(cell.count)
        const fontSize = Math.max(DOT_SIZE * 0.7, 10)
        ctx.font = `${fontSize}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cell.count.toString(), centerX, centerY)
      } else {
        // Empty cell - no dot
      }
    }
    
    ctx.restore()
  }, [isExploding, explosionProgress, DOT_SIZE])

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw cells with spawn animation
    for (let y = 0; y < board.height; y++) {
      // Only draw rows that have been spawned
      if (y >= spawnedRows) break
      
      for (let x = 0; x < board.width; x++) {
        const cell = board.cells[y][x]
        const alpha = y < spawnedRows ? 1 : 0
        drawCell(ctx, cell, x, y, alpha)
      }
    }

    // Draw hover effect
    if (hoveredCell && gameStatus === 'playing' && !isExploding) {
      const { x, y } = hoveredCell
      const cell = board.cells[y][x]
      
      if (cell.state === 'hidden') {
        ctx.save()
        ctx.globalAlpha = 0.3
        ctx.fillStyle = flagMode ? '#FF0000' : '#00FF00'
        ctx.beginPath()
        ctx.arc(
          CANVAS_PADDING + x * DOT_SPACING + DOT_SPACING / 2,
          CANVAS_PADDING + y * DOT_SPACING + DOT_SPACING / 2,
          DOT_SIZE / 2 + 2,
          0,
          Math.PI * 2
        )
        ctx.fill()
        ctx.restore()
      }
      
    }
  }, [board, spawnedRows, hoveredCell, gameStatus, flagMode, drawCell, isExploding])

  // Redraw when dependencies change
  useEffect(() => {
    drawBoard()
  }, [drawBoard])

  const getCellFromMouse = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    
    // Calculate the scale factor between the canvas display size and actual canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Convert mouse coordinates to canvas coordinates
    const canvasX = (e.clientX - rect.left) * scaleX
    const canvasY = (e.clientY - rect.top) * scaleY
    
    // Convert to grid coordinates
    const x = Math.floor((canvasX - CANVAS_PADDING) / DOT_SPACING)
    const y = Math.floor((canvasY - CANVAS_PADDING) / DOT_SPACING)

    if (x >= 0 && x < board.width && y >= 0 && y < board.height) {
      return { x, y }
    }
    return null
  }, [board.width, board.height, DOT_SPACING, CANVAS_PADDING])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromMouse(e)
    setHoveredCell(cell)
  }, [getCellFromMouse])

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromMouse(e)
    if (!cell || gameStatus !== 'playing' || isExploding) return

    if (flagMode) {
      if (isMultiplayer) {
        multiStore.toggleFlag(cell.x, cell.y)
      } else {
        gameStore.toggleFlag(cell.x, cell.y)
      }
    } else {
      if (isMultiplayer) {
        multiStore.makeMove(cell.x, cell.y, 'reveal')
      } else {
        gameStore.revealCell(cell.x, cell.y)
      }
    }
  }, [gameStatus, getCellFromMouse, flagMode, isMultiplayer, gameStore, multiStore, isExploding])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (isMultiplayer) {
          multiStore.toggleFlagMode()
        } else {
          gameStore.toggleFlagMode()
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (hoveredCell && gameStatus === 'playing' && !isExploding) {
          if (flagMode) {
            if (isMultiplayer) {
              multiStore.toggleFlag(hoveredCell.x, hoveredCell.y)
            } else {
              gameStore.toggleFlag(hoveredCell.x, hoveredCell.y)
            }
          } else {
            if (isMultiplayer) {
              multiStore.makeMove(hoveredCell.x, hoveredCell.y, 'reveal')
            } else {
              gameStore.revealCell(hoveredCell.x, hoveredCell.y)
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [hoveredCell, gameStatus, flagMode, isMultiplayer, gameStore, multiStore, isExploding])

  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  )
}