'use client'

import { ferryRoutes } from '@/const'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'

const { Overlay } = LayersControl

export function FerryRouteOverlay() {
  const route = ferryRoutes[0]
  return (
    <Overlay checked name={route.name}>
      <LayerGroup>
        <Polyline positions={route.path} />
        <Marker position={route.from.position}>
          <Popup>{route.from.name}</Popup>
        </Marker>
        <Marker position={route.to.position}>
          <Popup>{route.to.name}</Popup>
        </Marker>
      </LayerGroup>
    </Overlay>
  )
}
