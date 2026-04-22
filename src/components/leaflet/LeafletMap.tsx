'use client'

import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { LayersControl } from 'react-leaflet/LayersControl'
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CafeToGarageOverlay } from './CafeToGarageOverlay'
import { FerryRouteOverlay } from './FerryRouteOverlay'
import { GaragePerfGeoJsonOverlay } from './GaragePerfGeoJsonOverlay'
import './leafletDefaultIcon'
import styles from './LeafletMap.module.css'
import { CenterWatcher, ZoomWatcher } from './mapClientUtils'
import { UkWeatherPatchesOverlay } from './UkWeatherPatchesOverlay'
import { WarningsOverlay } from './WarningsOverlay'

const { BaseLayer } = LayersControl

const INITIAL_ZOOM = 5
const INITIAL_CENTER: [number, number] = [51.505, -0.09]

export default function LeafletMap() {
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [center, setCenter] = useState({
    lat: INITIAL_CENTER[0],
    lng: INITIAL_CENTER[1],
  })

  return (
    <>
      <div className={styles.container}>
        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          className={styles.mapContainer}
        >
          <ZoomWatcher onZoom={setZoom} />
          <CenterWatcher onCenter={setCenter} />

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
      <p className={styles.zoomDisplay}>
        Zoom: {zoom.toFixed(2)} · Center: {center.lat.toFixed(4)},{' '}
        {center.lng.toFixed(4)}
      </p>
    </>
  )
}
