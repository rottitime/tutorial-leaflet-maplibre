'use client'

import { PointFeatureCollection } from '@/types'
import { ensureImage, ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { Map } from 'maplibre-gl'

const SOURCE_ID = 'garages-source'
const LAYER_ID = 'garages-layer'
const ICON_ID = 'garage-icon'

export async function syncGarageLayer(map: Map, data: PointFeatureCollection | null) {
  if (!data) return

  await ensureImage(map, ICON_ID, '/icons/garage.png')
  upsertGeoJsonSource(map, SOURCE_ID, data)

  ensureLayer(map, {
    id: LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    layout: {
      'icon-image': ICON_ID,
      'icon-size': 0.8,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  })
}
