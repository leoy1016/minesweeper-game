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

  // Canvas configuration
  const DOT_SIZE = 12
  const DOT_SPACING = 20
  const CANVAS_PADDING = 30
  
  const canvasWidth = board.width * DOT_SPACING + CANVAS_PADDING * 2
  const canvasHeight = board.height * DOT_SPACING + CANVAS_PADDING * 2


  // Animation state
  const [spawnedRows, setSpawnedRows] = useState(0)

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
  }, [board.width, board.height])

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

    if (cell.state === 'hidden') {
      // White dot
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (cell.state === 'flagged') {
      // Red dot for flagged
      ctx.fillStyle = '#FF0000'
      ctx.beginPath()
      ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (cell.state === 'revealed') {
      if (cell.type === 'mine') {
        // Mine - red dot
        ctx.fillStyle = '#FF0000'
        ctx.beginPath()
        ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (cell.type === 'empty') {
        // Safe - green dot
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (cell.type === 'number') {
        // Number - colored dot
        ctx.fillStyle = getNumberColor(cell.count)
        ctx.beginPath()
        ctx.arc(centerX, centerY, DOT_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw number
        ctx.fillStyle = '#000000'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cell.count.toString(), centerX, centerY)
      }
    }

    ctx.restore()
  }, [])

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('No canvas ref')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('No canvas context')
      return
    }


    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)


    // Draw cells
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
    if (hoveredCell && gameStatus === 'playing') {
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
  }, [board, spawnedRows, hoveredCell, gameStatus, flagMode, drawCell])

  // Redraw when dependencies change
  useEffect(() => {
    drawBoard()
  }, [drawBoard])


  const getCellFromMouse = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const cellX = Math.floor((x - CANVAS_PADDING) / DOT_SPACING)
    const cellY = Math.floor((y - CANVAS_PADDING) / DOT_SPACING)

    if (cellX >= 0 && cellX < board.width && cellY >= 0 && cellY < board.height) {
      return { x: cellX, y: cellY }
    }

    return null
  }, [board.width, board.height])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromMouse(e)
    setHoveredCell(cell)
  }, [getCellFromMouse])

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing') return

    const cell = getCellFromMouse(e)
    if (!cell) return

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
  }, [gameStatus, getCellFromMouse, flagMode, isMultiplayer, gameStore, multiStore])

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
        if (hoveredCell && gameStatus === 'playing') {
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
  }, [hoveredCell, gameStatus, flagMode, isMultiplayer, gameStore, multiStore])

  return (
    <div className="flex justify-center items-center min-h-screen">
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
