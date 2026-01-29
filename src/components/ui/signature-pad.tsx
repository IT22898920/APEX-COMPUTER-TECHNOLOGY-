'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, Undo2, Download } from 'lucide-react'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  width?: number
  height?: number
}

export function SignaturePad({ onSave, width = 400, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([initialState])
  }, [])

  const saveState = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(prev => [...prev, state])
  }

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      saveState()
    }
    setIsDrawing(false)
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)

    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([initialState])
  }

  const undo = () => {
    if (history.length <= 1) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newHistory = history.slice(0, -1)
    const previousState = newHistory[newHistory.length - 1]

    ctx.putImageData(previousState, 0, 0)
    setHistory(newHistory)

    // Check if canvas is empty (only transparent pixels)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let isEmpty = true
    for (let i = 0; i < data.length; i += 4) {
      // Check alpha channel - if any pixel has opacity, canvas is not empty
      if (data[i + 3] > 0) {
        isEmpty = false
        break
      }
    }
    setHasSignature(!isEmpty)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    // Create a trimmed version of the signature
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Find bounds of the signature
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4
        // Check if pixel is not transparent (has opacity)
        if (data[i + 3] > 0) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    // Add padding
    const padding = 10
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(canvas.width, maxX + padding)
    maxY = Math.min(canvas.height, maxY + padding)

    const trimWidth = maxX - minX
    const trimHeight = maxY - minY

    // Create trimmed canvas
    const trimmedCanvas = document.createElement('canvas')
    trimmedCanvas.width = trimWidth
    trimmedCanvas.height = trimHeight
    const trimmedCtx = trimmedCanvas.getContext('2d')
    if (!trimmedCtx) return

    trimmedCtx.drawImage(canvas, minX, minY, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight)

    const dataUrl = trimmedCanvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="space-y-3">
      <div className="relative border-2 border-dashed rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full touch-none cursor-crosshair"
          style={{ maxHeight: `${height}px` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">Sign here</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={undo} disabled={history.length <= 1}>
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clear}>
            <Eraser className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <Button type="button" size="sm" onClick={handleSave} disabled={!hasSignature}>
          <Download className="h-4 w-4 mr-1" />
          Use Signature
        </Button>
      </div>
    </div>
  )
}
