'use client'

import 'leaflet/dist/leaflet.css'
import { LayersControl } from 'react-leaflet/LayersControl'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CafeToGarageOverlay } from './CafeToGarageOverlay'
import Debug from './Debug'
import { FerryRouteOverlay } from './FerryRouteOverlay'
import { GaragePerfGeoJsonOverlay } from './GaragePerfGeoJsonOverlay'
import './leafletDefaultIcon'
import styles from './LeafletMap.module.css'
import { UkWeatherPatchesOverlay } from './UkWeatherPatchesOverlay'
import { WarningsOverlay } from './WarningsOverlay'

const { BaseLayer } = LayersControl

export default function LeafletMap() {
  return (
    <div className={styles.container}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={5}
        className={styles.mapContainer}
      >
        <Debug />

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
          <GaragePerfGeoJsonOverlay />
          <CafeToGarageOverlay />
          <WarningsOverlay />
          <FerryRouteOverlay />
        </LayersControl>
      </MapContainer>
    </div>
  )
}
