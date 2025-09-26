import { NextResponse } from 'next/server'
import { roomStore } from '@/lib/multiplayer/roomStore'

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId
    const room = roomStore.getRoom(roomId)
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: room.id,
      seed: room.seed,
      players: room.players,
      createdAt: room.createdAt
    })
  } catch (error) {
    console.error('Error getting room:', error)
    return NextResponse.json(
      { error: 'Failed to get room' },
      { status: 500 }
    )
  }
}
