'use client'

import { parityConfig } from '@/lib/parityConfig'
import { FerryRoute, PointFeatureCollection, WarningPoint, WeatherPatch } from '@/types'
import maplibregl, { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { pairCafesToNearestGarages, syncCafeToGarageLayer } from './CafeToGarageLayer'
import { syncFerryLayer } from './FerryRouteLayer'
import { syncGarageLayer } from './GaragePerfLayer'
import styles from './MapLibreMap.module.css'
import { useFetchJson, useMapZoom } from './mapClientUtils'
import { useAnimatedPath, useRouteAnimationProgress } from './routeAnimation'
import { syncWarningsLayer } from './WarningsLayer'
import { syncWeatherLayer } from './UkWeatherLayer'

type BaseStyleId = 'osm' | 'basicEurope'

function baseStyle(styleId: BaseStyleId): maplibregl.StyleSpecification {
  if (styleId === 'basicEurope') {
    return {
      version: 8,
      sources: {
        carto: {
          type: 'raster',
          tiles: ['https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        },
      },
      layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
    }
  }

  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  }
}

export default function MapLibreMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const [ready, setReady] = useState(false)
  const [activeBaseStyle, setActiveBaseStyle] = useState<BaseStyleId>('osm')

  const garages = useFetchJson<PointFeatureCollection | null>(parityConfig.fetch.garages, null)
  const cafes = useFetchJson<PointFeatureCollection | null>(parityConfig.fetch.cafes, null)
  const warnings = useFetchJson<WarningPoint[]>(parityConfig.fetch.warnings, [])
  const weather = useFetchJson<WeatherPatch[]>(parityConfig.fetch.weather, [])
  const ferry = useFetchJson<FerryRoute | null>(parityConfig.fetch.ferries, null)

  const zoom = useMapZoom(mapRef.current)
  const routeProgress = useRouteAnimationProgress(
    parityConfig.animation.drawMs,
    parityConfig.animation.holdMs,
  )
  const animatedFerry = useAnimatedPath(ferry?.path ?? [], routeProgress, 14)

  const cafePairs = useMemo(
    () => pairCafesToNearestGarages(cafes, garages),
    [cafes, garages],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle(activeBaseStyle),
      center: [-0.09, 51.505],
      zoom: 5,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      mapRef.current = map
      setReady(true)
    })

    return () => {
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setStyle(baseStyle(activeBaseStyle))
  }, [activeBaseStyle, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    void syncGarageLayer(map, garages)
  }, [garages, ready, activeBaseStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    syncWeatherLayer(map, weather)
  }, [weather, ready, activeBaseStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    void syncWarningsLayer(map, warnings, zoom >= parityConfig.zoom.warningsMin)
  }, [warnings, zoom, ready, activeBaseStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    syncFerryLayer(map, ferry, animatedFerry)
  }, [ferry, animatedFerry, ready, activeBaseStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    void syncCafeToGarageLayer(
      map,
      cafePairs,
      zoom >= parityConfig.zoom.cafesMin,
      routeProgress,
    )
  }, [cafePairs, zoom, routeProgress, ready, activeBaseStyle])

  return (
    <div className={styles.container}>
      <div className={styles.baseToggle}>
        <button
          className={activeBaseStyle === 'osm' ? styles.activeToggle : ''}
          onClick={() => setActiveBaseStyle('osm')}
          type="button"
        >
          OpenStreetMap
        </button>
        <button
          className={activeBaseStyle === 'basicEurope' ? styles.activeToggle : ''}
          onClick={() => setActiveBaseStyle('basicEurope')}
          type="button"
        >
          Basic Europe
        </button>
      </div>
      <div ref={containerRef} className={styles.mapContainer} />
    </div>
  )
}
