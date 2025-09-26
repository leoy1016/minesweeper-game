'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ModeOption from '@/components/ModeOption'

const MODES = [
  { key: 'easy', label: 'Easy', color: 'var(--easy)' },
  { key: 'medium', label: 'Medium', color: 'var(--medium)' },
  { key: 'hard', label: 'Hard', color: 'var(--hard)' },
  { key: 'multi', label: 'Multiplayer', color: 'var(--multi)' },
] as const

export default function Home() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Header isInGame={false} />
      
      {/* Background overlay that changes color on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: hoveredMode 
            ? `color-mix(in srgb, ${hoveredMode === 'easy' ? 'var(--easy)' : 
                                   hoveredMode === 'medium' ? 'var(--medium)' :
                                   hoveredMode === 'hard' ? 'var(--hard)' :
                                   'var(--multi)'} 10%, black)`
            : 'transparent'
        }}
      />
      
      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8">
          {MODES.map((mode) => (
            <ModeOption
              key={mode.key}
              mode={mode.key as 'easy' | 'medium' | 'hard' | 'multi'}
              label={mode.label}
              color={mode.color}
              onHover={setHoveredMode}
              isHovered={hoveredMode === mode.key}
            />
          ))}
        </div>
      </div>
      
      {/* Credits link */}
      <div className="absolute bottom-6 right-6">
        <a 
          href="/credits" 
          className="text-gray-400 hover:text-white transition-colors cursor-pointer font-mono text-sm"
        >
          credits
        </a>
      </div>
    </div>
  )
}