import MapLibreMapClient from '@/components/maplibre/MapLibreMapClient'
import { MapProvider } from '@/context/MapContext'

export default function MapLibrePage() {
  return (
    <MapProvider>
      <h1>MapLibre demo</h1>
      <MapLibreMapClient />
    </MapProvider>
  )
}
