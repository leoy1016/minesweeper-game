'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import HUD from '@/components/HUD'
import BoardCanvas from '@/components/BoardCanvas'
import TypewriterText from '@/components/TypewriterText'
import { useGameStore } from '@/store/useGameStore'

export default function MediumGame() {
  const { startGame, gameStatus, resetGame } = useGameStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    startGame('medium')
  }, [startGame])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const handleReturnHome = () => {
    resetGame()
    // Fade to black and navigate
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000000;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.5s ease;
    `
    document.body.appendChild(overlay)
    
    requestAnimationFrame(() => {
      overlay.style.opacity = '1'
    })
    
    setTimeout(() => {
      window.location.href = '/'
    }, 500)
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
      <HUD isMultiplayer={false} />
      <BoardCanvas isMultiplayer={false} />
    </div>
  )
}
