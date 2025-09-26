import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Generate a 4-digit room code
    const roomId = Math.floor(1000 + Math.random() * 9000).toString()
    const seed = Math.floor(Math.random() * 1000000)
    
    // In a real implementation, you would store this in a database
    // For now, we'll just return the room code
    
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
