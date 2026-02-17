import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm",
        type === 'success' && "bg-green-50 border-green-200 text-green-800",
        type === 'error' && "bg-red-50 border-red-200 text-red-800"
      )}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
