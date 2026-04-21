'use client'

import { WarningPoint } from '@/types'
import { Icon } from 'leaflet'
import { useMemo, useState } from 'react'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Tooltip } from 'react-leaflet/Tooltip'
import { useFetchJson, ZoomWatcher } from './mapClientUtils'

const { Overlay } = LayersControl
const ZOOM_THRESHOLD = 8

const barrierIcon = new Icon({
  iconUrl: '/icons/barrier.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

export function WarningsOverlay() {
  const [zoom, setZoom] = useState(0)
  const warnings = useFetchJson<WarningPoint[]>('/api/test/warnings', [])

  const show = zoom >= ZOOM_THRESHOLD

  const style = useMemo(
    () => ({
      high: { color: '#ef4444', fillColor: '#ef4444' },
      medium: { color: '#f59e0b', fillColor: '#f59e0b' },
    }),
    [],
  )

  return (
    <Overlay checked name="Warnings (zoom 8+)">
      <LayerGroup>
        <ZoomWatcher onZoom={setZoom} />

        {show &&
          warnings.map((w) => (
            <LayerGroup key={w.id}>
              <CircleMarker
                center={w.position}
                radius={w.glowRadius}
                pathOptions={{
                  color: style[w.level].color,
                  fillColor: style[w.level].fillColor,
                  fillOpacity: w.glowOpacity,
                  opacity: 0,
                  weight: 0,
                }}
              />
              <Marker position={w.position} icon={barrierIcon}>
                <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                  {w.level}
                </Tooltip>
              </Marker>
            </LayerGroup>
          ))}
      </LayerGroup>
    </Overlay>
  )
}
