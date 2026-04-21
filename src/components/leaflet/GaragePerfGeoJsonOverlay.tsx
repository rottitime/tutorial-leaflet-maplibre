'use client'

import L, { Icon } from 'leaflet'
import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'

const { Overlay } = LayersControl

const customGarageIcon = new Icon({
  iconUrl: '/icons/garage.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

type GarageGeoJson = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { id: string }
    geometry: { type: 'Point'; coordinates: [number, number] }
  }>
}

export function GaragePerfGeoJsonOverlay() {
  const [data, setData] = useState<GarageGeoJson | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      const response = await fetch('/api/test/garages')
      const json = (await response.json()) as GarageGeoJson
      if (active) setData(json)
    }

    load().catch(() => {
      if (active) setData(null)
    })

    return () => {
      active = false
    }
  }, [])

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
