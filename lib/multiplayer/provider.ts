import { RealtimeProvider, ClientEvent, ServerEvent, Player } from './protocol'

// In-memory provider for local development
class DevLoopbackProvider implements RealtimeProvider {
  private rooms = new Map<string, {
    seed: number
    players: string[]
    subscribers: Map<string, (ev: ServerEvent) => void>
  }>()

  async createRoom(): Promise<{ roomId: string; seed: number }> {
    const roomId = Math.floor(1000 + Math.random() * 9000).toString()
    const seed = Math.floor(Math.random() * 1000000)
    
    this.rooms.set(roomId, {
      seed,
      players: [],
      subscribers: new Map()
    })
    
    return { roomId, seed }
  }

  async joinRoom(roomId: string): Promise<{ seed: number; you: Player; players: string[] }> {
    const room = this.rooms.get(roomId)
    if (!room) {
      throw new Error('Room not found')
    }
    
    // Check if room is already full
    if (room.players.length >= 2) {
      throw new Error('Room is full')
    }
    
    const playerId = `player_${Date.now()}`
    room.players.push(playerId)
    
    // Assign player based on current count
    const you: Player = room.players.length === 1 ? 'A' : 'B'
    
    // Notify all subscribers about the join
    const joinEvent: ServerEvent = {
      type: 'Joined',
      players: room.players,
      seed: room.seed,
      you
    }
    
    room.subscribers.forEach(callback => callback(joinEvent))
    
    return { seed: room.seed, you, players: room.players }
  }

  async publish(roomId: string, event: ClientEvent): Promise<void> {
    const room = this.rooms.get(roomId)
    if (!room) return
    
    // Only broadcast Action events, not Join events
    if (event.type === 'Action') {
      const serverEvent: ServerEvent = {
        type: 'Action',
        playerId: event.playerId,
        action: event.action,
        x: event.x,
        y: event.y,
        clientTs: event.clientTs
      }
      
      room.subscribers.forEach(callback => callback(serverEvent))
    }
  }

  subscribe(roomId: string, onServerEvent: (ev: ServerEvent) => void): () => void {
    const room = this.rooms.get(roomId)
    if (!room) return () => {}
    
    const subscriberId = `sub_${Date.now()}`
    room.subscribers.set(subscriberId, onServerEvent)
    
    return () => {
      room.subscribers.delete(subscriberId)
    }
  }
}

// Supabase provider (optional)
class SupabaseProvider implements RealtimeProvider {
  private supabase: unknown
  private clientId: string

  constructor() {
    // This would be initialized with actual Supabase client
    // For now, we'll throw an error if used without proper setup
    throw new Error('Supabase provider not implemented yet')
  }

  async createRoom(): Promise<{ roomId: string; seed: number }> {
    throw new Error('Not implemented')
  }

  async joinRoom(_roomId: string): Promise<{ seed: number; you: Player; players: string[] }> {
    throw new Error('Not implemented')
  }

  async publish(_roomId: string, _event: ClientEvent): Promise<void> {
    throw new Error('Not implemented')
  }

  subscribe(_roomId: string, _onServerEvent: (ev: ServerEvent) => void): () => void {
    throw new Error('Not implemented')
  }
}

// Factory function to create the appropriate provider
export function createRealtimeProvider(): RealtimeProvider {
  // Check if Supabase environment variables are available
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (hasSupabase) {
    try {
      return new SupabaseProvider()
    } catch {
      // Fall back to dev provider if Supabase fails
      return new DevLoopbackProvider()
    }
  }
  
  return new DevLoopbackProvider()
}

export { DevLoopbackProvider, SupabaseProvider }
