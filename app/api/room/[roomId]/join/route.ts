import { NextResponse } from 'next/server'
import { roomStore } from '@/lib/multiplayer/roomStore'

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId
    const result = roomStore.joinRoom(roomId)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join room' },
      { status: 400 }
    )
  }
}
