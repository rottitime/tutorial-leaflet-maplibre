'use client'

import { parityConfig } from '@/lib/parityConfig'
import { FerryRoute } from '@/types'
import { useLeafletContext } from '@react-leaflet/core'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'
import { useFetchJson } from './mapClientUtils'
import { densifyPath, easeInOutCubic } from './routeAnimation'

const { Overlay } = LayersControl

type LatLng = [number, number]

/**
 * Imperative animated ferry line + head dot.
 * No React re-renders per frame — rAF mutates the Leaflet layers directly.
 */
function AnimatedFerryLine({ path }: { path: LatLng[] }) {
  const ctx = useLeafletContext()
  const densePath = useMemo(() => densifyPath(path, 14), [path])

  useEffect(() => {
    const container = ctx.layerContainer ?? ctx.map
    if (!container || densePath.length < 2) return

    const line = L.polyline([], {
      color: '#2563eb',
      weight: 3,
      opacity: 0.9,
    })
    const head = L.circleMarker(densePath[0] as L.LatLngExpression, {
      radius: 3,
      color: '#1d4ed8',
      fillColor: '#3b82f6',
      fillOpacity: 1,
    })

    container.addLayer(line)
    container.addLayer(head)

    const { drawMs, holdMs } = parityConfig.animation
    const loopMs = drawMs + holdMs
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = (now - start) % loopMs
      const progress =
        elapsed < drawMs ? easeInOutCubic(elapsed / drawMs) : 1
      const end =
        Math.max(1, Math.round(progress * (densePath.length - 1))) + 1
      const len = Math.min(end, densePath.length)
      const slice = densePath.slice(0, len) as L.LatLngExpression[]

      line.setLatLngs(slice)
      const headPos = slice[slice.length - 1]
      if (headPos) head.setLatLng(headPos)

      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      container.removeLayer(line)
      container.removeLayer(head)
    }
  }, [ctx, densePath])

  return null
}

export function FerryRouteOverlay() {
  const route = useFetchJson<FerryRoute | null>(
    parityConfig.fetch.ferries,
    null,
  )

  return (
    <Overlay checked name={route?.name ?? 'Ferry route'}>
      <LayerGroup>
        {route && (
          <>
            <Polyline
              positions={route.path}
              pathOptions={{ color: '#334155', weight: 2, opacity: 0.25 }}
            />
            <AnimatedFerryLine path={route.path} />
            <Marker position={route.from.position}>
              <Popup>{route.from.name}</Popup>
            </Marker>
            <Marker position={route.to.position}>
              <Popup>{route.to.name}</Popup>
            </Marker>
          </>
        )}
      </LayerGroup>
    </Overlay>
  )
}
