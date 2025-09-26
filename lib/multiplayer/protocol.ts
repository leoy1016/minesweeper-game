export type Player = 'A' | 'B'

export type ClientEvent = 
  | { type: 'Join'; roomId: string; playerId: string }
  | { type: 'Action'; playerId: string; action: 'reveal' | 'flag'; x: number; y: number; clientTs: number }

export type ServerEvent =
  | { type: 'RoomCreated'; roomId: string; seed: number }
  | { type: 'Joined'; players: string[]; seed: number; you: Player }
  | { type: 'Start'; seed: number }
  | { type: 'Action'; playerId: string; action: 'reveal' | 'flag'; x: number; y: number; clientTs: number }
  | { type: 'State'; revealed: Set<string>; flags: Set<string>; currentPlayer: Player; turnEndsAt: number }
  | { type: 'Result'; winner: Player; reason: 'mine' | 'timeout' | 'allSafe' }

export interface RealtimeProvider {
  createRoom(): Promise<{ roomId: string; seed: number }>
  joinRoom(roomId: string): Promise<{ seed: number; you: Player; players: string[] }>
  publish(roomId: string, event: ClientEvent): Promise<void>
  subscribe(roomId: string, onServerEvent: (ev: ServerEvent) => void): () => void
}
