'use client'

import { parityConfig } from '@/lib/parityConfig'
import { LatLng, PointFeature, PointFeatureCollection } from '@/types'
import { useLeafletContext } from '@react-leaflet/core'
import L, { Icon } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'
import { useFetchJson, ZoomWatcher } from './mapClientUtils'
import { densifyPath, easeInOutCubic } from './routeAnimation'

const { Overlay } = LayersControl

const cafeIcon = new Icon({
  iconUrl: '/icons/cafe.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

type CafeToGarage = {
  cafeId: string
  cafe: LatLng
  garage: LatLng
}

const ZOOM_THRESHOLD = parityConfig.zoom.cafesMin
const STEPS_PER_SEGMENT = 24

function toLatLng(feature: PointFeature): LatLng {
  const [lng, lat] = feature.geometry.coordinates
  return [lat, lng]
}

function distanceSq(a: LatLng, b: LatLng) {
  const dLat = a[0] - b[0]
  const dLng = a[1] - b[1]
  return dLat * dLat + dLng * dLng
}

function pairCafesToNearestGarages(
  cafes: PointFeatureCollection,
  garages: PointFeatureCollection,
): CafeToGarage[] {
  const garagePositions = garages.features.map((f) => toLatLng(f))
  if (!garagePositions.length) return []

  return cafes.features.map((cafeFeature) => {
    const cafe = toLatLng(cafeFeature)
    let nearest = garagePositions[0]
    let best = distanceSq(cafe, nearest)

    for (let i = 1; i < garagePositions.length; i++) {
      const candidate = garagePositions[i]
      const d = distanceSq(cafe, candidate)
      if (d < best) {
        best = d
        nearest = candidate
      }
    }

    return {
      cafeId: String(cafeFeature.properties.id),
      cafe,
      garage: nearest,
    }
  })
}

/**
 * One imperative multi-polyline for all 700 animated cafe→garage lines,
 * plus one circle-marker head per route. Driven by a single rAF loop.
 * No React re-renders per frame.
 */
function AnimatedCafeRoutes({ pairs }: { pairs: CafeToGarage[] }) {
  const ctx = useLeafletContext()

  const densePaths = useMemo(
    () =>
      pairs.map((p) => densifyPath([p.cafe, p.garage], STEPS_PER_SEGMENT)),
    [pairs],
  )

  useEffect(() => {
    const container = ctx.layerContainer ?? ctx.map
    if (!container || !densePaths.length) return

    const animLine = L.polyline([], {
      color: '#16a34a',
      weight: 2,
      opacity: 0.85,
    })
    container.addLayer(animLine)

    const heads: L.CircleMarker[] = densePaths.map((dense) =>
      L.circleMarker(dense[0] as L.LatLngExpression, {
        radius: 3,
        color: '#15803d',
        fillColor: '#22c55e',
        fillOpacity: 1,
      }),
    )
    heads.forEach((h) => container.addLayer(h))

    const { drawMs, holdMs } = parityConfig.animation
    const loopMs = drawMs + holdMs
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = (now - start) % loopMs
      const progress =
        elapsed < drawMs ? easeInOutCubic(elapsed / drawMs) : 1

      const slices: L.LatLngExpression[][] = new Array(densePaths.length)
      for (let i = 0; i < densePaths.length; i++) {
        const dense = densePaths[i]
        const end =
          Math.max(1, Math.round(progress * (dense.length - 1))) + 1
        const len = Math.min(end, dense.length)
        slices[i] = dense.slice(0, len) as L.LatLngExpression[]

        const headPos = slices[i][slices[i].length - 1]
        if (headPos) heads[i].setLatLng(headPos)
      }
      animLine.setLatLngs(slices)

      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      container.removeLayer(animLine)
      heads.forEach((h) => container.removeLayer(h))
    }
  }, [ctx, densePaths])

  return null
}

export function CafeToGarageOverlay() {
  const [zoom, setZoom] = useState(0)
  const cafes = useFetchJson<PointFeatureCollection | null>(
    parityConfig.fetch.cafes,
    null,
  )
  const garages = useFetchJson<PointFeatureCollection | null>(
    parityConfig.fetch.garages,
    null,
  )

  const paired = useMemo(() => {
    if (!cafes || !garages) return []
    return pairCafesToNearestGarages(cafes, garages)
  }, [cafes, garages])

  const baseMultiLine = useMemo(
    () =>
      paired.map((p) => [p.cafe, p.garage] as LatLng[]) as L.LatLngExpression[][],
    [paired],
  )

  const show = zoom >= ZOOM_THRESHOLD

  return (
    <Overlay checked name="Cafes -> Garages (zoom 9+)">
      <LayerGroup>
        <ZoomWatcher onZoom={setZoom} />

        {show && baseMultiLine.length > 0 && (
          <>
            <Polyline
              positions={baseMultiLine}
              pathOptions={{ color: '#334155', weight: 1, opacity: 0.2 }}
            />
            <AnimatedCafeRoutes pairs={paired} />
            {paired.map((p) => (
              <Marker key={p.cafeId} position={p.cafe} icon={cafeIcon}>
                <Popup>{p.cafeId}</Popup>
              </Marker>
            ))}
          </>
        )}
      </LayerGroup>
    </Overlay>
  )
}
