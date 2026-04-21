import maplibregl, { Map } from 'maplibre-gl'

export type BaseStyleId = 'osm' | 'basicEurope'

const TERRAIN_SOURCE_ID = 'terrainSource'
const HILLSHADE_SOURCE_ID = 'hillshadeSource'
const HILLSHADE_LAYER_ID = 'hills'
const MAPTERHORN_TILEJSON_URL = 'https://tiles.mapterhorn.com/tilejson.json'

export function createBaseStyle(styleId: BaseStyleId): maplibregl.StyleSpecification {
  if (styleId === 'basicEurope') {
    return {
      version: 8,
      sources: {
        carto: {
          type: 'raster',
          tiles: ['https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        },
      },
      layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
    }
  }

  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  }
}

export function syncTerrain(map: Map, terrainEnabled: boolean) {
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
