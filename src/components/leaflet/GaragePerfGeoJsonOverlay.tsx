'use client'

import { parityConfig } from '@/lib/parityConfig'
import { PointFeatureCollection } from '@/types'
import L, { Icon } from 'leaflet'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { useFetchJson } from './mapClientUtils'

const { Overlay } = LayersControl

const customGarageIcon = new Icon({
  iconUrl: '/icons/garage.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

export function GaragePerfGeoJsonOverlay() {
  const data = useFetchJson<PointFeatureCollection | null>(parityConfig.fetch.garages, null)

  return (
    <Overlay checked name="Garages (perf test)">
      <LayerGroup>
        {data && (
          <GeoJSON
            data={data}
            pointToLayer={(feature, latlng) =>
              L.marker(latlng, {
                icon: customGarageIcon,
                title: String(feature.properties?.id ?? ''),
              })
            }
          />
        )}
      </LayerGroup>
    </Overlay>
  )
}
