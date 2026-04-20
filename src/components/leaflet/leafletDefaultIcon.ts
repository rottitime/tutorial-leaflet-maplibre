import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

function asset(mod: string | { src: string }) {
  return typeof mod === 'string' ? mod : mod.src
}

Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl')
L.Icon.Default.mergeOptions({
  iconUrl: asset(markerIcon),
  iconRetinaUrl: asset(markerIcon2x),
  shadowUrl: asset(markerShadow),
})
