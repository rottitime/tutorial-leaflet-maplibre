'use client'

import { parityConfig } from '@/lib/parityConfig'
import { LatLng, PointFeatureCollection } from '@/types'
import { FeatureCollection, LineString, Point } from 'geojson'
import { Map } from 'maplibre-gl'
import { ensureImage, ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { densifyPath } from './routeAnimation'

const ICON_ID = 'cafe-icon'
const CAFE_SOURCE_ID = 'cafes-source'
const ROUTE_BASE_SOURCE_ID = 'cafe-routes-base-source'
const ROUTE_ANIM_SOURCE_ID = 'cafe-routes-anim-source'
const CAFE_LAYER_ID = 'cafes-layer'
const ROUTE_BASE_LAYER_ID = 'cafe-routes-base-layer'
const ROUTE_ANIM_LAYER_ID = 'cafe-routes-anim-layer'

const STEPS_PER_SEGMENT = 24

type Pair = { id: string; cafe: LatLng; garage: LatLng }

/** Pre-densified path per pair, computed once when pairs change. */
export type CafeDensePath = { id: string; dense: LatLng[] }

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
  const garagePositions = garages.features.map((f) =>
    toLatLng(f.geometry.coordinates),
  )
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

/** Densify all paths once so the animation loop can just slice. */
export function buildCafeDensePaths(pairs: Pair[]): CafeDensePath[] {
  return pairs.map((p) => ({
    id: p.id,
    dense: densifyPath([p.cafe, p.garage], STEPS_PER_SEGMENT),
  }))
}

/**
 * Creates sources/layers and sets the base (static) data.
 * Visibility is handled natively by `minzoom` on each layer — no per-zoom
 * React work needed.
 */
export async function setupCafeToGarageLayer(map: Map, pairs: Pair[]) {
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
    features: pairs.map((p) => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [p.cafe[1], p.cafe[0]],
          [p.garage[1], p.garage[0]],
        ],
      },
    })),
  }

  const emptyAnim: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: [],
  }

  upsertGeoJsonSource(map, CAFE_SOURCE_ID, cafesGeo)
  upsertGeoJsonSource(map, ROUTE_BASE_SOURCE_ID, baseRoutes)
  upsertGeoJsonSource(map, ROUTE_ANIM_SOURCE_ID, emptyAnim)

  const minzoom = parityConfig.zoom.cafesMin

  ensureLayer(map, {
    id: ROUTE_BASE_LAYER_ID,
    type: 'line',
    source: ROUTE_BASE_SOURCE_ID,
    minzoom,
    paint: {
      'line-color': '#334155',
      'line-width': 1,
      'line-opacity': 0.2,
    },
  })

  ensureLayer(map, {
    id: ROUTE_ANIM_LAYER_ID,
    type: 'line',
    source: ROUTE_ANIM_SOURCE_ID,
    minzoom,
    paint: {
      'line-color': '#16a34a',
      'line-width': 2,
      'line-opacity': 0.85,
    },
  })

  ensureLayer(map, {
    id: CAFE_LAYER_ID,
    type: 'symbol',
    source: CAFE_SOURCE_ID,
    minzoom,
    layout: {
      'icon-image': ICON_ID,
      'icon-size': 0.75,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  })
}

/**
 * Per-frame update. Slices pre-densified paths and pushes to the anim source.
 * Does NOT rebuild the static base layer.
 */
export function animateCafeToGarageLayer(
  map: Map,
  densePaths: CafeDensePath[],
  progress: number,
) {
  if (!densePaths.length) return
  if (!map.getSource(ROUTE_ANIM_SOURCE_ID)) return

  const features: FeatureCollection<LineString>['features'] = new Array(
    densePaths.length,
  )

  for (let i = 0; i < densePaths.length; i++) {
    const { dense } = densePaths[i]
    const end = Math.max(1, Math.round(progress * (dense.length - 1))) + 1
    const coords = new Array(Math.min(end, dense.length))
    for (let j = 0; j < coords.length; j++) {
      const p = dense[j]
      coords[j] = [p[1], p[0]]
    }
    features[i] = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    }
  }

  upsertGeoJsonSource(map, ROUTE_ANIM_SOURCE_ID, {
    type: 'FeatureCollection',
    features,
  })
}
