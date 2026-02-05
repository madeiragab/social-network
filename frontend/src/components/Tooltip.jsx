import { useState } from 'react'
import { cn } from '../lib/utils'

export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
    left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2',
    right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2',
  }

  const arrows = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'top-1/2 right-0 translate-x-full -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'top-1/2 left-0 -translate-x-full -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute z-50 px-2 py-1 text-xs font-semibold text-white bg-gray-800 rounded pointer-events-none whitespace-nowrap fade-in duration-200",
          positions[position]
        )}>
          {content}
          <div className={cn(
            "absolute border-4",
            arrows[position]
          )} />
        </div>
      )}
    </div>
  )
}
