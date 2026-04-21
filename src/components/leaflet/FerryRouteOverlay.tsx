'use client'

import { FerryRoute } from '@/types'
import { useEffect, useState } from 'react'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'

const { Overlay } = LayersControl

export function FerryRouteOverlay() {
  const [route, setRoute] = useState<FerryRoute | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      const response = await fetch('/api/test/ferries')
      const json = (await response.json()) as FerryRoute
      if (active) setRoute(json)
    }

    load().catch(() => {
      if (active) setRoute(null)
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <Overlay checked name={route?.name ?? 'Ferry route'}>
      <LayerGroup>
        {route && (
          <>
            <Polyline positions={route.path} />
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
