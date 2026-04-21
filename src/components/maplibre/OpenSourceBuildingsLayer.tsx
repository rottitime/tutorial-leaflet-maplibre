'use client'

import { ensureLayer } from './mapClientUtils'
import { Map } from 'maplibre-gl'

const SOURCE_ID = 'open-buildings-source'
const LAYER_ID = 'open-buildings-3d'

/** OpenFreeMap vector tiles (OpenStreetMap-based, open source data pipeline). */
export function syncOpenSourceBuildingsLayer(map: Map, visible: boolean) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    })
  }

  ensureLayer(map, {
    id: LAYER_ID,
    type: 'fill-extrusion',
    source: SOURCE_ID,
    'source-layer': 'building',
    minzoom: 15,
    filter: ['!=', ['get', 'hide_3d'], true],
    paint: {
      'fill-extrusion-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'render_height'], ['get', 'height'], 0],
        0,
        '#cbd5e1',
        200,
        '#64748b',
      ],
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 0],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
      'fill-extrusion-opacity': 0.75,
    },
  })

  map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none')
}
