'use client'

import './leafletDefaultIcon'
import 'leaflet/dist/leaflet.css'
import { LayersControl } from 'react-leaflet/LayersControl'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { FerryRouteOverlay } from './FerryRouteOverlay'
import { UkWeatherPatchesOverlay } from './UkWeatherPatchesOverlay'
import styles from './LeafletMap.module.css'

const { BaseLayer } = LayersControl

export default function LeafletMap() {
  return (
    <div className={styles.container}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={5}
        className={styles.mapContainer}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </BaseLayer>

          <BaseLayer name="Basic Europe">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />
          </BaseLayer>

          <UkWeatherPatchesOverlay />
          <FerryRouteOverlay />
        </LayersControl>
      </MapContainer>
    </div>
  )
}
