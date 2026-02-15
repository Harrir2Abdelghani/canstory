"use client"

import { useEffect, useState } from 'react'

const LOGO_ASSET_PATH = '/images/canstory_logo.png'

type LogoSources = {
  light: string
  dark: string
}

export function useCanstoryLogo() {
  const [sources, setSources] = useState<LogoSources>({
    light: LOGO_ASSET_PATH,
    dark: LOGO_ASSET_PATH,
  })

  useEffect(() => {
    let isMounted = true

    const processLogo = async () => {
      try {
        const response = await fetch(LOGO_ASSET_PATH)
        if (!response.ok) return

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = (error) => reject(error)
          image.src = objectUrl
        })

        URL.revokeObjectURL(objectUrl)

        const width = imageElement.naturalWidth || imageElement.width
        const height = imageElement.naturalHeight || imageElement.height
        if (!width || !height) return

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(imageElement, 0, 0)
        const originalData = ctx.getImageData(0, 0, width, height)
        const transparentBuffer = new Uint8ClampedArray(originalData.data)
        const whiteThreshold = 245

        for (let i = 0; i < transparentBuffer.length; i += 4) {
          const r = transparentBuffer[i]
          const g = transparentBuffer[i + 1]
          const b = transparentBuffer[i + 2]

          if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
            transparentBuffer[i + 3] = 0
          }
        }

        const lightCanvas = document.createElement('canvas')
        lightCanvas.width = width
        lightCanvas.height = height
        const lightCtx = lightCanvas.getContext('2d')
        if (!lightCtx) return
        lightCtx.putImageData(new ImageData(transparentBuffer, width, height), 0, 0)

        const darkBuffer = new Uint8ClampedArray(transparentBuffer)
        for (let i = 0; i < darkBuffer.length; i += 4) {
          if (darkBuffer[i + 3] === 0) continue
          darkBuffer[i] = 183
          darkBuffer[i + 1] = 157
          darkBuffer[i + 2] = 230
        }

        const darkCanvas = document.createElement('canvas')
        darkCanvas.width = width
        darkCanvas.height = height
        const darkCtx = darkCanvas.getContext('2d')
        if (!darkCtx) return
        darkCtx.putImageData(new ImageData(darkBuffer, width, height), 0, 0)

        if (isMounted) {
          setSources({
            light: lightCanvas.toDataURL('image/png'),
            dark: darkCanvas.toDataURL('image/png'),
          })
        }
      } catch (error) {
        console.error('Unable to process Canstory logo', error)
      }
    }

    processLogo()

    return () => {
      isMounted = false
    }
  }, [])

  return sources
}
