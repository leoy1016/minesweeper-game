'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import HUD from '@/components/HUD'
import BoardCanvas from '@/components/BoardCanvas'
import { useGameStore } from '@/store/useGameStore'

export default function EasyGame() {
  const { startGame, gameStatus, resetGame } = useGameStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    startGame('easy')
  }, [startGame])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const handleReturnHome = () => {
    resetGame()
    window.location.href = '/'
  }

  if (gameStatus === 'won') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-green-400 mb-8">you win</div>
          <button
            onClick={handleReturnHome}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            return home
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-red-400 mb-8">you lost</div>
          <button
            onClick={handleReturnHome}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            return home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header isInGame={true} />
      <HUD isMultiplayer={false} />
      <BoardCanvas isMultiplayer={false} />
    </div>
  )
}