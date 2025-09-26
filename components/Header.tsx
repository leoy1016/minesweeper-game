'use client'

import { usePathname, useRouter } from 'next/navigation'

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
    <div className="fixed top-0 left-0 z-50 p-6">
      <h1 
        className={`text-2xl font-mono cursor-pointer select-none ${
          isHome ? 'text-white' : 'text-white hover:text-gray-300'
        }`}
        onClick={handleClick}
      >
        {title}
      </h1>
    </div>
  )
}