'use client'

import { LatLng, PointFeatureCollection } from '@/types'
import { densifyPath } from './routeAnimation'
import { ensureImage, ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { FeatureCollection, LineString, Point } from 'geojson'
import { Map } from 'maplibre-gl'

const ICON_ID = 'cafe-icon'
const CAFE_SOURCE_ID = 'cafes-source'
const ROUTE_BASE_SOURCE_ID = 'cafe-routes-base-source'
const ROUTE_ANIM_SOURCE_ID = 'cafe-routes-anim-source'
const CAFE_LAYER_ID = 'cafes-layer'
const ROUTE_BASE_LAYER_ID = 'cafe-routes-base-layer'
const ROUTE_ANIM_LAYER_ID = 'cafe-routes-anim-layer'

type Pair = { id: string; cafe: LatLng; garage: LatLng }

function toLatLng([lng, lat]: [number, number]): LatLng {
  return [lat, lng]
}

function distanceSq(a: LatLng, b: LatLng) {
  const dLat = a[0] - b[0]
  const dLng = a[1] - b[1]
  return dLat * dLat + dLng * dLng
}

export function pairCafesToNearestGarages(
  cafes: PointFeatureCollection | null,
  garages: PointFeatureCollection | null,
): Pair[] {
  if (!cafes || !garages) return []
  const garagePositions = garages.features.map((f) => toLatLng(f.geometry.coordinates))
  if (!garagePositions.length) return []

  return cafes.features.map((cafeFeature) => {
    const cafe = toLatLng(cafeFeature.geometry.coordinates)
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

    return { id: cafeFeature.properties.id, cafe, garage: nearest }
  })
}

function routeFeature(pair: Pair, progress: number) {
  const dense = densifyPath([pair.cafe, pair.garage], 24)
  const end = Math.max(1, Math.round(progress * (dense.length - 1))) + 1
  const animated = dense.slice(0, end)

  return {
    base: {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [pair.cafe[1], pair.cafe[0]],
          [pair.garage[1], pair.garage[0]],
        ],
      },
    },
    anim: {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: animated.map((p) => [p[1], p[0]]),
      },
    },
  }
}

export async function syncCafeToGarageLayer(
  map: Map,
  pairs: Pair[],
  visible: boolean,
  progress: number,
) {
  await ensureImage(map, ICON_ID, '/icons/cafe.png')

  const cafesGeo: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: pairs.map((p) => ({
      type: 'Feature',
      properties: { id: p.id },
      geometry: { type: 'Point', coordinates: [p.cafe[1], p.cafe[0]] },
    })),
  }

  const baseRoutes: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: pairs.map((p) => routeFeature(p, progress).base),
  }

  const animRoutes: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: pairs.map((p) => routeFeature(p, progress).anim),
  }

  upsertGeoJsonSource(map, CAFE_SOURCE_ID, cafesGeo)
  upsertGeoJsonSource(map, ROUTE_BASE_SOURCE_ID, baseRoutes)
  upsertGeoJsonSource(map, ROUTE_ANIM_SOURCE_ID, animRoutes)

  ensureLayer(map, {
    id: ROUTE_BASE_LAYER_ID,
    type: 'line',
    source: ROUTE_BASE_SOURCE_ID,
    paint: { 'line-color': '#334155', 'line-width': 1, 'line-opacity': 0.2 },
  })

  ensureLayer(map, {
    id: ROUTE_ANIM_LAYER_ID,
    type: 'line',
    source: ROUTE_ANIM_SOURCE_ID,
    paint: { 'line-color': '#16a34a', 'line-width': 2, 'line-opacity': 0.85 },
  })

  ensureLayer(map, {
    id: CAFE_LAYER_ID,
    type: 'symbol',
    source: CAFE_SOURCE_ID,
    layout: {
      'icon-image': ICON_ID,
      'icon-size': 0.75,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  })

  const visibility = visible ? 'visible' : 'none'
  map.setLayoutProperty(ROUTE_BASE_LAYER_ID, 'visibility', visibility)
  map.setLayoutProperty(ROUTE_ANIM_LAYER_ID, 'visibility', visibility)
  map.setLayoutProperty(CAFE_LAYER_ID, 'visibility', visibility)
}
