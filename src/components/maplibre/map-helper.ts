import { Map } from 'maplibre-gl'

export function runWhenStyleReady(map: Map, fn: () => void) {
  if (map.isStyleLoaded()) {
    fn()
    return () => {}
  }

  const onStyleData = () => {
    if (!map.isStyleLoaded()) return
    map.off('styledata', onStyleData)
    fn()
  }

  map.on('styledata', onStyleData)
  return () => map.off('styledata', onStyleData)
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
) {
  if (!map.getLayer(layer.id)) map.addLayer(layer)
}
