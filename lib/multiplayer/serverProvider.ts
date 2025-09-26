import { RealtimeProvider, ClientEvent, ServerEvent, Player } from './protocol'

// Server-side provider that uses API routes
class ServerProvider implements RealtimeProvider {
  private currentRoomId: string | null = null
  private unsubscribe: (() => void) | null = null

  async createRoom(): Promise<{ roomId: string; seed: number }> {
    const response = await fetch('/api/room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to create room')
    }

    const data = await response.json()
    return { roomId: data.roomId, seed: data.seed }
  }

  async joinRoom(roomId: string): Promise<{ seed: number; you: Player; players: string[] }> {
    this.currentRoomId = roomId
    
    const response = await fetch(`/api/room/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to join room')
    }

    const data = await response.json()
    return {
      seed: data.seed,
      you: data.you,
      players: data.players
    }
  }

  async publish(roomId: string, event: ClientEvent): Promise<void> {
    // For now, we'll just log the event
    // In a real implementation, this would send the event to other players
    console.log('Publishing event:', event)
  }

  subscribe(roomId: string, onServerEvent: (ev: ServerEvent) => void): () => void {
    // For now, we'll use polling to simulate real-time updates
    // In a real implementation, this would use WebSockets or Server-Sent Events
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/room/${roomId}`)
        if (response.ok) {
          const room = await response.json()
          if (room.players.length === 2) {
            onServerEvent({
              type: 'Start',
              seed: room.seed
            })
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 1000) // Poll every second

    this.unsubscribe = () => {
      clearInterval(pollInterval)
    }

    return this.unsubscribe
  }
}

export { ServerProvider }
