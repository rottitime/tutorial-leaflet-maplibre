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
