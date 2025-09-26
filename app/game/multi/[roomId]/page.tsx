'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import HUD from '@/components/HUD'
import BoardCanvas from '@/components/BoardCanvas'
import TypewriterText from '@/components/TypewriterText'
import { useMultiStore } from '@/store/useMultiStore'
import { multiplayerClient } from '@/lib/multiplayer/client'
import { ServerEvent } from '@/lib/multiplayer/protocol'

export default function MultiplayerGame() {
  const params = useParams()
  const roomId = params.roomId as string
  
  const {
    joinRoom,
    updatePlayers,
    startGame,
    makeMove,
    setResult,
    gameStatus,
    result,
    you,
    players,
    reset
  } = useMultiStore()
  
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasJoinedRef = useRef(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize game only once when component mounts
  useEffect(() => {
    if (isInitialized) return
    
    const initializeGame = async () => {
      try {
        const gameData = await multiplayerClient.joinRoom(roomId)
        console.log('Game data received:', gameData)
        console.log('Players array:', gameData.players)
        console.log('Players length:', gameData.players.length)
        joinRoom(roomId, gameData.players, gameData.you, gameData.seed)
        
        // Only start game if there are actually 2 different players
        if (gameData.players.length === 2) {
          console.log('Starting game with 2 players')
          startGame(gameData.seed)
        } else {
          console.log('Waiting for more players, current count:', gameData.players.length)
        }
        
        setIsConnected(true)
        setIsInitialized(true)

        // Subscribe to game events only after successful room join
        const unsubscribe = multiplayerClient.subscribe((event: ServerEvent) => {
          switch (event.type) {
            case 'Joined':
              updatePlayers(event.players)
              if (event.players.length === 2) {
                startGame(event.seed)
              }
              break
            case 'Start':
              startGame(event.seed)
              break
            case 'Action':
              // Handle other player's moves
              if (event.playerId !== you) {
                makeMove(event.x, event.y, event.action)
              }
              break
            case 'State':
              // Update game state
              // This would need to be implemented based on the actual state structure
              break
            case 'Result':
              setResult(event)
              break
          }
        })

        // Store unsubscribe function for cleanup
        return () => {
          unsubscribe()
          multiplayerClient.disconnect()
        }
      } catch (err) {
        setError('Failed to join room')
        console.error('Join error:', err)
      }
    }

    initializeGame()
  }, [roomId, isInitialized])

  const handleReturnHome = () => {
    reset()
    multiplayerClient.disconnect()
    
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

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-400 text-xl font-mono mb-4">{error}</div>
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-white text-xl font-mono">Connecting...</div>
        </motion.div>
      </div>
    )
  }

  if (gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-white text-xl font-mono mb-4">
            Waiting for players... ({players.length}/2)
          </div>
          <div className="text-gray-400 font-mono text-sm">
            Room Code: {roomId}
          </div>
        </motion.div>
      </div>
    )
  }

  if (gameStatus === 'finished' && result) {
    const isWinner = result.winner === you
    const winText = isWinner ? 'you win' : 'you lost'
    const winColor = isWinner ? 'text-green-400' : 'text-red-400'
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TypewriterText
            text={winText}
            speed={150}
            className={`text-4xl ${winColor} mb-4`}
          />
          <div className="text-gray-400 font-mono text-sm mb-8">
            {result.reason === 'mine' ? 'Hit a mine' : 
             result.reason === 'timeout' ? 'Time ran out' : 
             'All safe cells revealed'}
          </div>
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
      <HUD isMultiplayer={true} />
      <BoardCanvas isMultiplayer={true} />
    </div>
  )
}
