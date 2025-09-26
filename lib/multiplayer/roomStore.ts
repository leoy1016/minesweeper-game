// Simple in-memory room store that persists across requests
// In production, this would be replaced with a real database

interface Room {
  id: string
  seed: number
  players: string[]
  createdAt: number
}

class RoomStore {
  private rooms = new Map<string, Room>()
  private subscribers = new Map<string, Set<(event: any) => void>>()

  createRoom(): { roomId: string; seed: number } {
    const roomId = Math.floor(1000 + Math.random() * 9000).toString()
    const seed = Math.floor(Math.random() * 1000000)
    
    const room: Room = {
      id: roomId,
      seed,
      players: [],
      createdAt: Date.now()
    }
    
    this.rooms.set(roomId, room)
    console.log(`Created room ${roomId} with seed ${seed}`)
    
    return { roomId, seed }
  }

  joinRoom(roomId: string): { seed: number; you: 'A' | 'B'; players: string[] } | null {
    const room = this.rooms.get(roomId)
    if (!room) {
      return null
    }
    
    if (room.players.length >= 2) {
      throw new Error('Room is full')
    }
    
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    room.players.push(playerId)
    
    const you: 'A' | 'B' = room.players.length === 1 ? 'A' : 'B'
    
    console.log(`Player ${you} joined room ${roomId}, total players: ${room.players.length}`)
    
    // Notify subscribers
    this.notifySubscribers(roomId, {
      type: 'Joined',
      players: room.players,
      seed: room.seed,
      you
    })
    
    return {
      seed: room.seed,
      you,
      players: room.players
    }
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null
  }

  subscribe(roomId: string, callback: (event: any) => void): () => void {
    if (!this.subscribers.has(roomId)) {
      this.subscribers.set(roomId, new Set())
    }
    
    this.subscribers.get(roomId)!.add(callback)
    
    return () => {
      const roomSubscribers = this.subscribers.get(roomId)
      if (roomSubscribers) {
        roomSubscribers.delete(callback)
        if (roomSubscribers.size === 0) {
          this.subscribers.delete(roomId)
        }
      }
    }
  }

  private notifySubscribers(roomId: string, event: any) {
    const roomSubscribers = this.subscribers.get(roomId)
    if (roomSubscribers) {
      roomSubscribers.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('Error notifying subscriber:', error)
        }
      })
    }
  }

  // Clean up old rooms (older than 1 hour)
  cleanup() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.createdAt < oneHourAgo) {
        this.rooms.delete(roomId)
        this.subscribers.delete(roomId)
        console.log(`Cleaned up old room ${roomId}`)
      }
    }
  }
}

// Global instance
export const roomStore = new RoomStore()

// Clean up old rooms every 10 minutes
setInterval(() => {
  roomStore.cleanup()
}, 10 * 60 * 1000)
