import 'leaflet/dist/leaflet.css'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import styles from './LeafletMap.module.css'

export default function LeafletMap() {
  return (
    <div className={styles.container}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={5}
        className={styles.mapContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  )
}
