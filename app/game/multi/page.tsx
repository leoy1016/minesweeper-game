'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { multiplayerClient } from '@/lib/multiplayer/client'

export default function MultiplayerLobby() {
  const [roomCode, setRoomCode] = useState(['', '', '', ''])
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const { roomId } = await multiplayerClient.createRoom()
      // The room creator should join the room they created
      await multiplayerClient.joinRoom(roomId)
      router.push(`/game/multi/${roomId}`)
    } catch (error) {
      console.error('Failed to create room:', error)
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    const code = roomCode.join('')
    if (code.length !== 4) return
    
    setIsJoining(true)
    try {
      // Just navigate to the room page - the join will happen there
      router.push(`/game/multi/${code}`)
    } catch (error) {
      console.error('Failed to join room:', error)
      setIsJoining(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newCode = [...roomCode]
    newCode[index] = value
    
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
    
    setRoomCode(newCode)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !roomCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header isInGame={false} />
      
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-mono text-white mb-12">Multiplayer</h1>
          
          <div className="space-y-8">
            {/* Create Room */}
            <motion.button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className={`px-8 py-4 rounded-lg font-mono text-lg transition-colors ${
                isCreating
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              whileHover={!isCreating ? { scale: 1.05 } : {}}
              whileTap={!isCreating ? { scale: 0.95 } : {}}
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </motion.button>
            
            <div className="text-gray-400 font-mono">or</div>
            
            {/* Join Room */}
            <div className="space-y-4">
              <div className="text-white font-mono">Join Room</div>
              <div className="flex gap-2 justify-center">
                {roomCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-mono bg-gray-800 text-white border border-gray-600 rounded focus:border-yellow-400 focus:outline-none"
                  />
                ))}
              </div>
              <motion.button
                onClick={handleJoinRoom}
                disabled={isJoining || roomCode.some(d => !d)}
                className={`px-6 py-2 rounded font-mono transition-colors ${
                  isJoining || roomCode.some(d => !d)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 text-black hover:bg-yellow-500'
                }`}
                whileHover={!isJoining && !roomCode.some(d => !d) ? { scale: 1.05 } : {}}
                whileTap={!isJoining && !roomCode.some(d => !d) ? { scale: 0.95 } : {}}
              >
                {isJoining ? 'Joining...' : 'Join'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
