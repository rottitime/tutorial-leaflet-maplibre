import maplibregl, { Map } from 'maplibre-gl'

const TERRAIN_SOURCE_ID = 'terrainSource'
const HILLSHADE_SOURCE_ID = 'hillshadeSource'
const HILLSHADE_LAYER_ID = 'hills'
const MAPTERHORN_TILEJSON_URL = 'https://tiles.mapterhorn.com/tilejson.json'

export function createWorldStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      world: {
        type: 'geojson',
        data: '/data/world.json',
      },
    },
    layers: [
      {
        id: 'sea',
        type: 'background',
        paint: { 'background-color': '#dbeafe' },
      },
      {
        id: 'land',
        type: 'fill',
        source: 'world',
        paint: {
          'fill-color': '#f8fafc',
          'fill-outline-color': '#94a3b8',
        },
      },
    ],
  }
}

export function syncTerrain(map: Map, terrainEnabled: boolean) {
  if (!map.isStyleLoaded()) {
    map.once('idle', () => syncTerrain(map, terrainEnabled))
    return
  }

  if (terrainEnabled) {
    if (!map.getSource(TERRAIN_SOURCE_ID)) {
      map.addSource(TERRAIN_SOURCE_ID, {
        type: 'raster-dem',
        url: MAPTERHORN_TILEJSON_URL,
        tileSize: 256,
      })
    }

    if (!map.getSource(HILLSHADE_SOURCE_ID)) {
      map.addSource(HILLSHADE_SOURCE_ID, {
        type: 'raster-dem',
        url: MAPTERHORN_TILEJSON_URL,
        tileSize: 256,
      })
    }

    if (!map.getLayer(HILLSHADE_LAYER_ID)) {
      map.addLayer({
        id: HILLSHADE_LAYER_ID,
        type: 'hillshade',
        source: HILLSHADE_SOURCE_ID,
        layout: { visibility: 'visible' },
        paint: { 'hillshade-shadow-color': '#473B24' },
      })
    }

    map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1 })
    map.setPitch(70)
    map.setBearing(-20)
    map.setLayoutProperty(HILLSHADE_LAYER_ID, 'visibility', 'visible')
    return
  }

  if (map.getLayer(HILLSHADE_LAYER_ID)) {
    map.setLayoutProperty(HILLSHADE_LAYER_ID, 'visibility', 'none')
  }
  map.setTerrain(null)
  map.setPitch(0)
  map.setBearing(0)
}
