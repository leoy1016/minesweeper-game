'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import HUD from '@/components/HUD'
import BoardCanvas from '@/components/BoardCanvas'
import { useGameStore } from '@/store/useGameStore'

export default function HardGame() {
  const { startGame, gameStatus, resetGame } = useGameStore()
  const [isClient, setIsClient] = useState(false)

  const handleReturnHome = () => {
    resetGame()
    window.location.href = '/'
  }

  useEffect(() => {
    setIsClient(true)
    startGame('hard')
  }, [startGame])

  // Auto-redirect to home when lost (after explosion animation)
  useEffect(() => {
    if (gameStatus === 'lost') {
      const timer = setTimeout(() => {
        handleReturnHome()
      }, 2000) // Wait 2 seconds for explosion animation
      
      return () => clearTimeout(timer)
    }
  }, [gameStatus, handleReturnHome])

  // Auto-redirect to home when won (after winning animation)
  useEffect(() => {
    if (gameStatus === 'won') {
      const timer = setTimeout(() => {
        handleReturnHome()
      }, 2000) // Wait 2 seconds for winning animation
      
      return () => clearTimeout(timer)
    }
  }, [gameStatus, handleReturnHome])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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