'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void
  className?: string
  width?: number
  height?: number
}

export function SignaturePad({
  onSignatureChange,
  className,
  width = 400,
  height = 150,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const isDrawingRef = useRef(false)
  const hasSignatureRef = useRef(false)
  const onSignatureChangeRef = useRef(onSignatureChange)
  const isInitializedRef = useRef(false)

  // Keep callback ref updated
  useEffect(() => {
    onSignatureChangeRef.current = onSignatureChange
  }, [onSignatureChange])

  // Keep refs in sync with state
  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  useEffect(() => {
    hasSignatureRef.current = hasSignature
  }, [hasSignature])

  const getCoordinatesFromTouch = useCallback((touch: Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    }
  }, [])

  const getCoordinatesFromMouse = useCallback((e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Only initialize canvas once (white background)
    if (!isInitializedRef.current) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      isInitializedRef.current = true
    }

    // Set up canvas drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Touch event handlers with passive: false
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return

      const { x, y } = getCoordinatesFromTouch(touch, canvas)
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      isDrawingRef.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isDrawingRef.current) return

      const touch = e.touches[0]
      if (!touch) return

      const { x, y } = getCoordinatesFromTouch(touch, canvas)
      ctx.lineTo(x, y)
      ctx.stroke()
      setHasSignature(true)
      hasSignatureRef.current = true
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (isDrawingRef.current && hasSignatureRef.current) {
        const dataUrl = canvas.toDataURL('image/png')
        onSignatureChangeRef.current(dataUrl)
      }
      setIsDrawing(false)
      isDrawingRef.current = false
    }

    // Add touch event listeners with passive: false to allow preventDefault
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [getCoordinatesFromTouch])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const { x, y } = getCoordinatesFromMouse(e.nativeEvent, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const { x, y } = getCoordinatesFromMouse(e.nativeEvent, canvas)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const handleMouseUp = () => {
    if (isDrawing && hasSignature) {
      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png')
        onSignatureChangeRef.current(dataUrl)
      }
    }
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    hasSignatureRef.current = false
    onSignatureChangeRef.current(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full touch-none cursor-crosshair"
          style={{ maxWidth: `${width}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hasSignature ? 'Signature captured' : 'Sign above using mouse or touch'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
