'use client'

import { useRouter } from 'next/navigation'

interface ModeOptionProps {
  mode: 'easy' | 'medium' | 'hard' | 'multi'
  label: string
  color: string
  onHover: (mode: string | null) => void
  isHovered: boolean
}

export default function ModeOption({ 
  mode, 
  label, 
  color, 
  onHover, 
  isHovered 
}: ModeOptionProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/game/${mode}`)
  }

  return (
    <div
      className="relative cursor-pointer select-none"
      onMouseEnter={() => onHover(mode)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
    >
      <div
        className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
          isHovered 
            ? 'bg-zinc-900/80' 
            : 'bg-transparent'
        }`}
      >
        <span 
          className="text-white font-mono text-lg"
          style={{ color: isHovered ? color : '#EDEDED' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}