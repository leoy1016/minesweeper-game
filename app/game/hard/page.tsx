'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import HUD from '@/components/HUD'
import BoardCanvas from '@/components/BoardCanvas'
import TypewriterText from '@/components/TypewriterText'
import { useGameStore } from '@/store/useGameStore'

export default function HardGame() {
  const { startGame, gameStatus, resetGame, board } = useGameStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    startGame('hard')
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
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TypewriterText
            text="you win"
            speed={150}
            className="text-4xl text-green-400 mb-8"
          />
          <motion.button
            onClick={handleReturnHome}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            return home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (gameStatus === 'lost') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TypewriterText
            text="you lost"
            speed={150}
            className="text-4xl text-red-400 mb-8"
          />
          <motion.button
            onClick={handleReturnHome}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            return home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header isInGame={true} />
      <div className="pt-20">
        <HUD isMultiplayer={false} />
        <BoardCanvas isMultiplayer={false} />
      </div>
    </div>
  )
}
