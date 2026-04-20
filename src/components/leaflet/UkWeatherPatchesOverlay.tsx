'use client'

import { useMemo } from 'react'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'

const { Overlay } = LayersControl

const UK = { south: 49.85, north: 60.9, west: -8.2, east: 1.85 }

type Kind = 'hot' | 'cold' | 'rain'

const STYLE: Record<
  Kind,
  { fillColor: string; color: string; fillOpacity: number; weight: number }
> = {
  hot: { fillColor: '#f97316', color: '#ea580c', fillOpacity: 0.4, weight: 0 },
  cold: { fillColor: '#38bdf8', color: '#0284c7', fillOpacity: 0.38, weight: 0 },
  rain: { fillColor: '#d1d5db', color: '#9ca3af', fillOpacity: 0.48, weight: 0 },
}

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function pickKind(): Kind {
  const u = Math.random()
  if (u < 0.34) return 'hot'
  if (u < 0.68) return 'cold'
  return 'rain'
}

function buildPatches(n: number) {
  const { south, north, west, east } = UK
  return Array.from({ length: n }, (_, i) => {
    const kind = pickKind()
    const radius =
      kind === 'rain' ? rnd(38, 95) : kind === 'hot' ? rnd(22, 62) : rnd(24, 68)
    return {
      i,
      center: [rnd(south, north), rnd(west, east)] as [number, number],
      radius,
      kind,
    }
  })
}

export function UkWeatherPatchesOverlay() {
  const patches = useMemo(() => buildPatches(72), [])

  return (
    <Overlay checked name="Demo weather (random)">
      <LayerGroup>
        {patches.map((p) => (
          <CircleMarker
            key={p.i}
            center={p.center}
            radius={p.radius}
            pathOptions={STYLE[p.kind]}
          />
        ))}
      </LayerGroup>
    </Overlay>
  )
}
