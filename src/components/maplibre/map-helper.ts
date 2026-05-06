import { Map } from 'maplibre-gl'

export function runWhenStyleReady(map: Map, fn: () => void) {
  if (map.isStyleLoaded()) {
    fn()
    return () => {}
  }

  map.once('load', fn)
  return () => map.off('load', fn)
}

export function addSourceIfMissing(
  map: Map,
  id: Parameters<Map['addSource']>[0],
  source: Parameters<Map['addSource']>[1],
) {
  if (!map.getSource(id)) map.addSource(id, source)
}

export function addLayerIfMissing(
  map: Map,
  layer: Parameters<Map['addLayer']>[0],
  beforeId?: string,
) {
  if (map.getLayer(layer.id)) return
  if (beforeId && map.getLayer(beforeId)) {
    map.addLayer(layer, beforeId)
    return
  }
  map.addLayer(layer)
}
