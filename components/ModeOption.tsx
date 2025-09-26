'use client'

import { motion } from 'framer-motion'
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
    // Full screen fade to black before navigation
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000000;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.5s ease;
    `
    document.body.appendChild(overlay)
    
    // Fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1'
    })
    
    // Navigate after fade
    setTimeout(() => {
      router.push(`/game/${mode}`)
    }, 500)
  }

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      onMouseEnter={() => onHover(mode)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
          isHovered 
            ? 'bg-zinc-900/80' 
            : 'bg-transparent'
        }`}
        animate={{
          backgroundColor: isHovered ? 'rgba(39, 39, 42, 0.8)' : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      >
        <span 
          className="text-white font-mono text-lg"
          style={{ color: isHovered ? color : '#EDEDED' }}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  )
}
