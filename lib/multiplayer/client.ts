import { ServerProvider } from './serverProvider'
import { RealtimeProvider, ClientEvent, ServerEvent } from './protocol'

class MultiplayerClient {
  private provider: RealtimeProvider
  private currentRoomId: string | null = null
  private unsubscribe: (() => void) | null = null

  constructor() {
    this.provider = new ServerProvider()
  }

  async createRoom(): Promise<{ roomId: string; seed: number }> {
    const result = await this.provider.createRoom()
    this.currentRoomId = result.roomId
    return result
  }

  async joinRoom(roomId: string): Promise<{ seed: number; you: 'A' | 'B'; players: string[] }> {
    const result = await this.provider.joinRoom(roomId)
    this.currentRoomId = roomId
    return result
  }

  subscribe(onEvent: (event: ServerEvent) => void): () => void {
    if (!this.currentRoomId) {
      throw new Error('No room joined')
    }

    this.unsubscribe = this.provider.subscribe(this.currentRoomId, onEvent)
    return this.unsubscribe
  }

  async publish(event: ClientEvent): Promise<void> {
    if (!this.currentRoomId) {
      throw new Error('No room joined')
    }

    await this.provider.publish(this.currentRoomId, event)
  }

  disconnect(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.currentRoomId = null
  }
}

// Singleton instance
export const multiplayerClient = new MultiplayerClient()
