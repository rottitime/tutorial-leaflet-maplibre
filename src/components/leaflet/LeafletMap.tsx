'use client'

import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { LayersControl } from 'react-leaflet/LayersControl'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CafeToGarageOverlay } from './CafeToGarageOverlay'
import Debug from './Debug'
import { FerryRouteOverlay } from './FerryRouteOverlay'
import { GaragePerfGeoJsonOverlay } from './GaragePerfGeoJsonOverlay'
import './leafletDefaultIcon'
import styles from './LeafletMap.module.css'
import { ZoomWatcher } from './mapClientUtils'
import { UkWeatherPatchesOverlay } from './UkWeatherPatchesOverlay'
import { WarningsOverlay } from './WarningsOverlay'

const { BaseLayer } = LayersControl

const INITIAL_ZOOM = 5

export default function LeafletMap() {
  const [zoom, setZoom] = useState(INITIAL_ZOOM)

  return (
    <>
      <div className={styles.container}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={INITIAL_ZOOM}
          className={styles.mapContainer}
        >
          <Debug />
          <ZoomWatcher onZoom={setZoom} />

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
      <p className={styles.zoomDisplay}>Zoom: {zoom.toFixed(2)}</p>
    </>
  )
}
