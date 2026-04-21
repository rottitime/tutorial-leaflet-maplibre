'use client'

import { Icon } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { CircleMarker } from 'react-leaflet/CircleMarker'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'
import { useAnimatedPath, useRouteAnimationProgress } from './routeAnimation'

const { Overlay } = LayersControl

const cafeIcon = new Icon({
  iconUrl: '/icons/cafe.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

type PointFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: { id: string }
    geometry: { type: 'Point'; coordinates: [number, number] }
  }>
}

type LatLng = [number, number]

type CafeToGarage = {
  cafeId: string
  cafe: LatLng
  garage: LatLng
}

const ZOOM_THRESHOLD = 9

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap()

  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])

  useMapEvents({
    zoomend(e) {
      onZoom(e.target.getZoom())
    },
  })

  return null
}

function toLatLng(feature: PointFeatureCollection['features'][number]): LatLng {
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

function AnimatedCafeRoute({
  cafe,
  garage,
  cafeId,
  progress,
}: {
  cafe: LatLng
  garage: LatLng
  cafeId: string
  progress: number
}) {
  const animated = useAnimatedPath([cafe, garage], progress, 24)
  const head = animated[animated.length - 1]

  if (!head) return null

  return (
    <LayerGroup>
      <Polyline
        positions={[cafe, garage]}
        pathOptions={{ color: '#334155', weight: 1, opacity: 0.2 }}
      />
      <Polyline
        positions={animated}
        pathOptions={{ color: '#16a34a', weight: 2, opacity: 0.85 }}
      />
      <CircleMarker
        center={head}
        radius={3}
        pathOptions={{ color: '#15803d', fillColor: '#22c55e', fillOpacity: 1 }}
      />
      <Marker position={cafe} icon={cafeIcon}>
        <Popup>{cafeId}</Popup>
      </Marker>
    </LayerGroup>
  )
}

export function CafeToGarageOverlay() {
  const [zoom, setZoom] = useState(0)
  const [cafes, setCafes] = useState<PointFeatureCollection | null>(null)
  const [garages, setGarages] = useState<PointFeatureCollection | null>(null)
  const progress = useRouteAnimationProgress()

  useEffect(() => {
    let active = true

    const load = async () => {
      const [cafesRes, garagesRes] = await Promise.all([
        fetch('/api/test/cafes'),
        fetch('/api/test/garages'),
      ])

      const [cafesJson, garagesJson] = (await Promise.all([
        cafesRes.json(),
        garagesRes.json(),
      ])) as [PointFeatureCollection, PointFeatureCollection]

      if (!active) return
      setCafes(cafesJson)
      setGarages(garagesJson)
    }

    load().catch(() => {
      if (!active) return
      setCafes(null)
      setGarages(null)
    })

    return () => {
      active = false
    }
  }, [])

  const paired = useMemo(() => {
    if (!cafes || !garages) return []
    return pairCafesToNearestGarages(cafes, garages)
  }, [cafes, garages])

  const show = zoom >= ZOOM_THRESHOLD

  return (
    <Overlay checked name="Cafes -> Garages (zoom 9+)">
      <LayerGroup>
        <ZoomWatcher onZoom={setZoom} />

        {show &&
          paired.map((p) => (
            <AnimatedCafeRoute
              key={p.cafeId}
              cafe={p.cafe}
              garage={p.garage}
              cafeId={p.cafeId}
              progress={progress}
            />
          ))}
      </LayerGroup>
    </Overlay>
  )
}
