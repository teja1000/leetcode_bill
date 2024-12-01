import React from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
  value: string
  width?: number
  height?: number
}

export const Barcode: React.FC<BarcodeProps> = ({ value, width = 2, height = 40 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, value, {
        format: 'CODE128',
        width,
        height,
        displayValue: false,
        margin: 0
      })
    }
  }, [value, width, height])

  return <canvas ref={canvasRef} className="w-full" />
}

