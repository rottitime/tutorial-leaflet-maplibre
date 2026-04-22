'use client'

import { parityConfig } from '@/lib/parityConfig'
import {
  FerryRoute,
  PointFeatureCollection,
  WarningPoint,
  WeatherPatch,
} from '@/types'
import maplibregl, { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  pairCafesToNearestGarages,
  syncCafeToGarageLayer,
} from './CafeToGarageLayer'
import Debug from './Debug'
import { syncFerryLayer } from './FerryRouteLayer'
import { syncGarageLayer } from './GaragePerfLayer'
import { useFetchJson, useMapZoom } from './mapClientUtils'
import { MapLibreControls } from './MapLibreControls'
import styles from './MapLibreMap.module.css'
import { BaseStyleId, createBaseStyle, syncTerrain } from './mapScene'
import { syncOpenSourceBuildingsLayer } from './OpenSourceBuildingsLayer'
import { useAnimatedPath, useRouteAnimationProgress } from './routeAnimation'
import { syncWeatherLayer } from './UkWeatherLayer'
import { syncWarningsLayer } from './WarningsLayer'

export default function MapLibreMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const [ready, setReady] = useState(false)
  const [activeBaseStyle, setActiveBaseStyle] = useState<BaseStyleId>('osm')
  const [terrainEnabled, setTerrainEnabled] = useState(false)
  const [openBuildingsEnabled, setOpenBuildingsEnabled] = useState(false)

  const garages = useFetchJson<PointFeatureCollection | null>(
    parityConfig.fetch.garages,
    null,
  )
  const cafes = useFetchJson<PointFeatureCollection | null>(
    parityConfig.fetch.cafes,
    null,
  )
  const warnings = useFetchJson<WarningPoint[]>(parityConfig.fetch.warnings, [])
  const weather = useFetchJson<WeatherPatch[]>(parityConfig.fetch.weather, [])
  const ferry = useFetchJson<FerryRoute | null>(
    parityConfig.fetch.ferries,
    null,
  )

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
      style: createBaseStyle(activeBaseStyle),
      center: [-0.09, 51.505],
      zoom: 4.03,
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
    map.setStyle(createBaseStyle(activeBaseStyle))
  }, [activeBaseStyle, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    syncTerrain(map, terrainEnabled)
  }, [terrainEnabled, ready, activeBaseStyle])

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

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    syncOpenSourceBuildingsLayer(
      map,
      openBuildingsEnabled &&
        terrainEnabled &&
        zoom >= parityConfig.zoom.openBuildingsMin,
    )
  }, [openBuildingsEnabled, terrainEnabled, zoom, ready, activeBaseStyle])

  return (
    <>
      <div className={styles.container}>
        <Debug map={mapRef.current} />
        <MapLibreControls
          activeBaseStyle={activeBaseStyle}
          terrainEnabled={terrainEnabled}
          openBuildingsEnabled={openBuildingsEnabled}
          onSelectBaseStyle={setActiveBaseStyle}
          onToggleTerrain={() => setTerrainEnabled((prev) => !prev)}
          onToggleOpenBuildings={() => setOpenBuildingsEnabled((prev) => !prev)}
          className={styles.baseToggle}
          activeButtonClassName={styles.activeToggle}
        />
        <div ref={containerRef} className={styles.mapContainer} />
      </div>
      <p className={styles.zoomDisplay}>Zoom: {zoom.toFixed(2)}</p>
    </>
  )
}
