'use client'

import { Map } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

type Props = {
  map: Map | null
  className?: string
}

/**
 * Shows current zoom + center below the map. Updates via DOM writes on map
 * events — no React state, so it never re-renders the parent.
 */
export function MapViewDisplay({ map, className }: Props) {
  const ref = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    if (!map) return
    const el = ref.current
    if (!el) return

    const render = () => {
      const z = map.getZoom()
      const c = map.getCenter()
      el.textContent = `Zoom: ${z.toFixed(2)} · Center: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`
    }

    render()
    map.on('zoomend', render)
    map.on('moveend', render)

    return () => {
      map.off('zoomend', render)
      map.off('moveend', render)
    }
  }, [map])

  return <p ref={ref} className={className} />
}
