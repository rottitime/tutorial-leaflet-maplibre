import { ferryRoutes } from '@/const'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { LayerGroup } from 'react-leaflet/LayerGroup'
import { LayersControl } from 'react-leaflet/LayersControl'
import { MapContainer } from 'react-leaflet/MapContainer'
import { Marker } from 'react-leaflet/Marker'
import { Polyline } from 'react-leaflet/Polyline'
import { Popup } from 'react-leaflet/Popup'
import { TileLayer } from 'react-leaflet/TileLayer'
import styles from './LeafletMap.module.css'

const { BaseLayer, Overlay } = LayersControl

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

          <FerryRouteOverlay />
        </LayersControl>
      </MapContainer>
    </div>
  )
}

const FerryRouteOverlay = () => {
  /** Bundled apps do not serve Leaflet's default relative icon URLs; wire real asset URLs once. */
  function bundledAssetUrl(mod: string | { src: string }) {
    return typeof mod === 'string' ? mod : mod.src
  }

  Reflect.deleteProperty(L.Icon.Default.prototype, '_getIconUrl')
  L.Icon.Default.mergeOptions({
    iconUrl: bundledAssetUrl(markerIcon),
    iconRetinaUrl: bundledAssetUrl(markerIcon2x),
    shadowUrl: bundledAssetUrl(markerShadow),
  })
  return (
    <Overlay checked name={ferryRoutes[0].name}>
      <LayerGroup>
        <Polyline positions={ferryRoutes[0].path} />
        <Marker position={ferryRoutes[0].from.position}>
          <Popup>{ferryRoutes[0].from.name}</Popup>
        </Marker>
        <Marker position={ferryRoutes[0].to.position}>
          <Popup>{ferryRoutes[0].to.name}</Popup>
        </Marker>
      </LayerGroup>
    </Overlay>
  )
}
