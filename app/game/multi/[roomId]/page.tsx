'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import HUD from '@/components/HUD'
import BoardCanvas from '@/components/BoardCanvas'
import { useMultiStore } from '@/store/useMultiStore'
import { multiplayerClient } from '@/lib/multiplayer/client'
import { ServerEvent } from '@/lib/multiplayer/protocol'

export default function MultiplayerGame() {
  const params = useParams()
  const roomId = params.roomId as string
  
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'playing' | 'finished' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState(roomId)
  
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

  const hasInitialized = useRef(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Initialize the game once
  useEffect(() => {
    if (hasInitialized.current) return
    
    const init = async () => {
      try {
        console.log('Initializing multiplayer game for room:', roomId)
        hasInitialized.current = true
        
        const gameData = await multiplayerClient.joinRoom(roomId)
        console.log('Joined room:', gameData)
        
        joinRoom(roomId, gameData.players, gameData.you, gameData.seed)
        setStatus('waiting')
        
        // If we already have 2 players, start immediately
        if (gameData.players.length === 2) {
          console.log('Starting game immediately with 2 players')
          startGame(gameData.seed)
          setStatus('playing')
        }
        
        // Subscribe to events
        unsubscribeRef.current = multiplayerClient.subscribe((event: ServerEvent) => {
          console.log('Received event:', event)
          switch (event.type) {
            case 'Joined':
              updatePlayers(event.players)
              if (event.players.length === 2) {
                startGame(event.seed)
                setStatus('playing')
              }
              break
            case 'Start':
              startGame(event.seed)
              setStatus('playing')
              break
            case 'Action':
              if (event.playerId !== you) {
                makeMove(event.x, event.y, event.action)
              }
              break
            case 'Result':
              setResult(event)
              setStatus('finished')
              break
          }
        })
        
      } catch (err) {
        console.error('Failed to join room:', err)
        setError('Failed to join room')
        setStatus('error')
      }
    }
    
    init()
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      multiplayerClient.disconnect()
    }
  }, [roomId]) // Only depend on roomId

  const handleReturnHome = () => {
    reset()
    multiplayerClient.disconnect()
    window.location.href = '/'
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl font-mono mb-4">{error}</div>
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

  if (status === 'connecting') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-mono">Connecting...</div>
          <div className="text-gray-400 font-mono text-sm mt-2">
            Room: {roomCode}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl font-mono mb-4">
            Waiting for players... ({players.length}/2)
          </div>
          <div className="text-gray-400 font-mono text-sm mb-8">
            Room Code: {roomCode}
          </div>
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

  if (status === 'finished' && result) {
    const isWinner = result.winner === you
    const winText = isWinner ? 'you win' : 'you lost'
    const winColor = isWinner ? 'text-green-400' : 'text-red-400'
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl ${winColor} mb-4`}>
            {winText}
          </div>
          <div className="text-gray-400 font-mono text-sm mb-8">
            {result.reason === 'mine' ? 'Hit a mine' : 
             result.reason === 'timeout' ? 'Time ran out' : 
             'All safe cells revealed'}
          </div>
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
      <HUD isMultiplayer={true} />
      <BoardCanvas isMultiplayer={true} />
    </div>
  )
}