import maplibregl, { Map } from 'maplibre-gl'

export type BaseStyleId = 'osm' | 'basicEurope'

const TERRAIN_SOURCE_ID = 'terrain-dem'
const TERRAIN_TILES = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']

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
        tiles: TERRAIN_TILES,
        tileSize: 256,
        maxzoom: 15,
      })
    }
    map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: 1.2 })
    map.setPitch(55)
    map.setBearing(-20)
    return
  }

  map.setTerrain(null)
  map.setPitch(0)
  map.setBearing(0)
}
