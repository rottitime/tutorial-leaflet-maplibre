'use client'

import { FerryRoute } from '@/types'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'
import { useFetchJson } from './mapClientUtils'
import { useAnimatedPath, useRouteAnimationProgress } from './routeAnimation'

const { Overlay } = LayersControl

export function FerryRouteOverlay() {
  const route = useFetchJson<FerryRoute | null>('/api/test/ferries', null)
  const progress = useRouteAnimationProgress()
  const animatedPath = useAnimatedPath(route?.path ?? [], progress, 14)

  return (
    <Overlay checked name={route?.name ?? 'Ferry route'}>
      <LayerGroup>
        {route && (
          <>
            <Polyline
              positions={route.path}
              pathOptions={{ color: '#334155', weight: 2, opacity: 0.25 }}
            />
            <Polyline
              positions={animatedPath}
              pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.9 }}
            />
            {animatedPath.length > 0 && (
              <CircleMarker
                center={animatedPath[animatedPath.length - 1]}
                radius={3}
                pathOptions={{ color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 1 }}
              />
            )}
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
