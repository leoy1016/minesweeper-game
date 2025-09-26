'use client'

import { Flag } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useMultiStore } from '@/store/useMultiStore'

interface HUDProps {
  isMultiplayer?: boolean
}

export default function HUD({ isMultiplayer = false }: HUDProps) {
  const { flagMode, toggleFlagMode, board } = useGameStore()
  const { currentPlayer, you, turnEndsAt, gameStatus, board: multiBoard } = useMultiStore()
  
  const currentBoard = isMultiplayer ? multiBoard : board
  const isYourTurn = isMultiplayer && currentPlayer === you && gameStatus === 'playing'
  const timeLeft = turnEndsAt ? Math.max(0, Math.ceil((turnEndsAt - Date.now()) / 1000)) : 0

  return (
    <div className="fixed top-0 right-0 z-50 p-6 flex items-center gap-4">
      {isMultiplayer && (
        <div className="text-center">
          <div className={`text-sm font-mono ${
            isYourTurn ? 'text-green-400' : 'text-gray-400'
          }`}>
            {isYourTurn ? 'your turn' : 'their turn'}
          </div>
          {timeLeft > 0 && (
            <div className="text-lg font-mono text-white">
              {timeLeft}s
            </div>
          )}
        </div>
      )}
      
      {/* Mine counter */}
      <div className="text-white font-mono text-lg">
        {currentBoard.mineCount - currentBoard.flaggedCount}
      </div>
      
      <button
        onClick={toggleFlagMode}
        className={`p-2 rounded-lg transition-colors ${
          flagMode 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        title="Toggle flag mode (F)"
      >
        <Flag size={20} />
      </button>
    </div>
  )
}