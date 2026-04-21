import { useMapEvents } from 'react-leaflet'

export default function Debug() {
  useMapEvents({
    zoomend(e) {
      console.log('Zoom level:', e.target.getZoom())
    },
  })

  return null
}
