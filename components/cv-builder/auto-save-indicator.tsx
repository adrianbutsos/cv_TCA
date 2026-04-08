'use client'

import { useEffect, useState } from 'react'
import { Check, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (lastSaved) {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)

      if (diff < 60) {
        setDisplayText('Guardado hace unos segundos')
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60)
        setDisplayText(`Guardado hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`)
      } else {
        setDisplayText(`Guardado a las ${lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`)
      }
    }
  }, [lastSaved, status])

  if (status === 'idle') return null

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <Clock className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-muted-foreground">Guardando...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-muted-foreground">{displayText}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-red-600 dark:text-red-400">Error al guardar</span>
        </>
      )}
    </div>
  )
}
