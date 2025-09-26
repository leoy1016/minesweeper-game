'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface HeaderProps {
  isInGame?: boolean
}

export default function Header({ isInGame: _isInGame = false }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const isHome = pathname === '/'
  const title = isHome ? 'sweeper' : 'swpr'
  
  const handleClick = () => {
    if (!isHome) {
      router.push('/')
    }
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className={`text-2xl font-mono cursor-pointer select-none ${
          isHome ? 'text-white' : 'text-white hover:text-gray-300'
        }`}
        onClick={handleClick}
        whileHover={!isHome ? { scale: 1.05 } : {}}
        whileTap={!isHome ? { scale: 0.95 } : {}}
      >
        {title}
      </motion.h1>
    </motion.div>
  )
}
