'use client'

import { WeatherKind, WeatherPatch } from '@/types'
import { useEffect, useState } from 'react'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'

const { Overlay } = LayersControl

const STYLE: Record<
  WeatherKind,
  { fillColor: string; color: string; fillOpacity: number; weight: number }
> = {
  hot: { fillColor: '#f97316', color: '#ea580c', fillOpacity: 0.4, weight: 0 },
  cold: { fillColor: '#38bdf8', color: '#0284c7', fillOpacity: 0.38, weight: 0 },
  rain: { fillColor: '#d1d5db', color: '#9ca3af', fillOpacity: 0.48, weight: 0 },
}

export function UkWeatherPatchesOverlay() {
  const [patches, setPatches] = useState<WeatherPatch[]>([])

  useEffect(() => {
    let active = true

    const load = async () => {
      const response = await fetch('/api/test/weather')
      const json = (await response.json()) as WeatherPatch[]
      if (active) setPatches(json)
    }

    load().catch(() => {
      if (active) setPatches([])
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <Overlay checked name="Demo weather (random)">
      <LayerGroup>
        {patches.map((p) => (
          <CircleMarker
            key={p.id}
            center={p.center}
            radius={p.radius}
            pathOptions={STYLE[p.kind]}
          />
        ))}
      </LayerGroup>
    </Overlay>
  )
}
