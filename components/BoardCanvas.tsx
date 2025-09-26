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

  const drawCell = useCallback((
    ctx: CanvasRenderingContext2D,
    cell: Cell,
    x: number,
    y: number
  ) => {
    const centerX = CANVAS_PADDING + x * DOT_SPACING + DOT_SPACING / 2
    const centerY = CANVAS_PADDING + y * DOT_SPACING + DOT_SPACING / 2

    ctx.save()
    
    if (cell.state === 'hidden') {
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
        // Number with color
        ctx.fillStyle = getNumberColor(cell.count)
        ctx.font = '12px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(cell.count.toString(), centerX, centerY)
      } else {
        // Empty cell - no dot
      }
    }
    
    ctx.restore()
  }, [])

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all cells
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const cell = board.cells[y][x]
        drawCell(ctx, cell, x, y)
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
  }, [board, hoveredCell, gameStatus, flagMode, drawCell])

  // Redraw when dependencies change
  useEffect(() => {
    drawBoard()
  }, [drawBoard])

  const getCellFromMouse = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left - CANVAS_PADDING) / DOT_SPACING)
    const y = Math.floor((e.clientY - rect.top - CANVAS_PADDING) / DOT_SPACING)

    if (x >= 0 && x < board.width && y >= 0 && y < board.height) {
      return { x, y }
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
    const cell = getCellFromMouse(e)
    if (!cell || gameStatus !== 'playing') return

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
    <div className="flex flex-col justify-center items-center py-8">
      <div className="text-white mb-4 text-sm">
        Board: {board.width}x{board.height} | Mines: {board.mineCount} | Status: {gameStatus}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="cursor-pointer border border-gray-600"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  )
}