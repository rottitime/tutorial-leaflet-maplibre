'use client'

import { parityConfig } from '@/lib/parityConfig'
import { WarningPoint } from '@/types'
import { ensureImage, ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { FeatureCollection, Point } from 'geojson'
import { Map } from 'maplibre-gl'

const SOURCE_ID = 'warnings-source'
const GLOW_LAYER_ID = 'warnings-glow'
const ICON_LAYER_ID = 'warnings-icon'
const LABEL_LAYER_ID = 'warnings-label'
const ICON_ID = 'warning-icon'

/**
 * Creates sources/layers with native `minzoom` visibility.
 * Call only when data changes — zoom changes are handled by MapLibre.
 */
export async function syncWarningsLayer(map: Map, warnings: WarningPoint[]) {
  const data: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: warnings.map((w) => ({
      type: 'Feature',
      properties: {
        level: w.level,
        radius: w.glowRadius,
        opacity: w.glowOpacity,
        color: w.level === 'high' ? '#ef4444' : '#f59e0b',
      },
      geometry: { type: 'Point', coordinates: [w.position[1], w.position[0]] },
    })),
  }

  await ensureImage(map, ICON_ID, '/icons/barrier.png')
  upsertGeoJsonSource(map, SOURCE_ID, data)

  const minzoom = parityConfig.zoom.warningsMin

  ensureLayer(map, {
    id: GLOW_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    minzoom,
    paint: {
      'circle-color': ['get', 'color'],
      'circle-opacity': ['get', 'opacity'],
      'circle-radius': ['get', 'radius'],
      'circle-stroke-width': 0,
    },
  })

  ensureLayer(map, {
    id: ICON_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    minzoom,
    layout: {
      'icon-image': ICON_ID,
      'icon-size': 0.7,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  })

  ensureLayer(map, {
    id: LABEL_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    minzoom,
    layout: {
      'text-field': ['get', 'level'],
      'text-size': 11,
      'text-offset': [0, -2.2],
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': '#111827',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1,
    },
  })
}
