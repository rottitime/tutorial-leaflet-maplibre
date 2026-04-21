'use client'

import { Map } from 'maplibre-gl'
import { useEffect } from 'react'

type Props = {
  map: Map | null
}

export default function Debug({ map }: Props) {
  useEffect(() => {
    if (!map) return

    const onZoomEnd = () => {
      console.log('Zoom level:', map.getZoom())
    }

    map.on('zoomend', onZoomEnd)

    return () => {
      map.off('zoomend', onZoomEnd)
    }
  }, [map])

  return null
}
