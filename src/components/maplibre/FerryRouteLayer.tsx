'use client'

import { FerryRoute } from '@/types'
import { Map } from 'maplibre-gl'
import { ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { densifyPath } from './routeAnimation'

const BASE_SOURCE_ID = 'ferry-base-source'
const ANIM_SOURCE_ID = 'ferry-anim-source'
const BASE_LAYER_ID = 'ferry-base-layer'
const ANIM_LAYER_ID = 'ferry-anim-layer'

const STEPS_PER_SEGMENT = 14

function toCoords(path: [number, number][]) {
  return path.map((p) => [p[1], p[0]])
}

/** Pre-densify once so the animation loop only slices. */
export function buildFerryDensePath(route: FerryRoute | null) {
  if (!route) return []
  return densifyPath(route.path, STEPS_PER_SEGMENT)
}

/**
 * Creates sources/layers and sets the base (static) route once.
 */
export function setupFerryLayer(map: Map, route: FerryRoute | null) {
  if (!route) return

  upsertGeoJsonSource(map, BASE_SOURCE_ID, {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: toCoords(route.path) },
  })

  upsertGeoJsonSource(map, ANIM_SOURCE_ID, {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: [] },
  })

  ensureLayer(map, {
    id: BASE_LAYER_ID,
    type: 'line',
    source: BASE_SOURCE_ID,
    paint: { 'line-color': '#334155', 'line-width': 2, 'line-opacity': 0.25 },
  })

  ensureLayer(map, {
    id: ANIM_LAYER_ID,
    type: 'line',
    source: ANIM_SOURCE_ID,
    paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-opacity': 0.9 },
  })
}

/**
 * Per-frame update. Slices the pre-densified path and pushes to the anim source.
 */
export function animateFerryLayer(
  map: Map,
  densePath: [number, number][],
  progress: number,
) {
  if (!densePath.length) return
  if (!map.getSource(ANIM_SOURCE_ID)) return

  const end = Math.max(1, Math.round(progress * (densePath.length - 1))) + 1
  const length = Math.min(end, densePath.length)
  const coords = new Array(length)
  for (let i = 0; i < length; i++) {
    const p = densePath[i]
    coords[i] = [p[1], p[0]]
  }

  upsertGeoJsonSource(map, ANIM_SOURCE_ID, {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  })
}
