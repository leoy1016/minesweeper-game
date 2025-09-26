import { NextResponse } from 'next/server'
import { roomStore } from '@/lib/multiplayer/roomStore'

export async function POST() {
  try {
    const { roomId, seed } = roomStore.createRoom()
    
    return NextResponse.json({ 
      roomId, 
      seed,
      success: true 
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
