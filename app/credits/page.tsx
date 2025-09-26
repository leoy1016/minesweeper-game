'use client'

import Header from '@/components/Header'

export default function Credits() {
  return (
    <div className="min-h-screen bg-black">
      <Header isInGame={false} />
      
      {/* Main content centered */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-white font-mono text-2xl">
            ig: @leo.yyng
          </div>
        </div>
      </div>
    </div>
  )
}
