'use client'

import { useMap } from '@/context/MapContext'
import { parityConfig } from '@/lib/parityConfig'
import {
  FerryRoute,
  PointFeatureCollection,
  WarningPoint,
  WeatherPatch,
} from '@/types'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  animateCafeToGarageLayer,
  buildCafeDensePaths,
  CafeDensePath,
  pairCafesToNearestGarages,
  setupCafeToGarageLayer,
} from './CafeToGarageLayer'
import {
  animateFerryLayer,
  buildFerryDensePath,
  setupFerryLayer,
} from './FerryRouteLayer'
import { syncGarageLayer } from './GaragePerfLayer'
import { useFetchJson } from './mapClientUtils'
import { MapLibreControls } from './MapLibreControls'
import styles from './MapLibreMap.module.css'
import { createWorldStyle, syncTerrain } from './mapScene'
import { MapViewDisplay } from './MapViewDisplay'
import { syncOpenSourceBuildingsLayer } from './OpenSourceBuildingsLayer'
import { BathymetryLayer } from './BathymetryLayer'
import { PolygonBoxes } from './PolygonBoxes'
import { easeInOutCubic } from './routeAnimation'
import { TwoRoutes } from './TwoRoutes'
import { syncWeatherLayer } from './UkWeatherLayer'
import { syncWarningsLayer } from './WarningsLayer'

const GARAGES_LAYER_ID = 'garages-layer'
const WEATHER_LAYER_ID = 'weather-circles'

export default function MapLibreMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [terrainEnabled, setTerrainEnabled] = useState(false)
  const [openBuildingsEnabled, setOpenBuildingsEnabled] = useState(false)
  const [weatherEnabled, setWeatherEnabled] = useState(false)
  const [garagesEnabled, setGaragesEnabled] = useState(false)
  const { createMap, mapRef, ready } = useMap()

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

  const cafePairs = useMemo(
    () => pairCafesToNearestGarages(cafes, garages),
    [cafes, garages],
  )

  const cafeDensePaths = useMemo(
    () => buildCafeDensePaths(cafePairs),
    [cafePairs],
  )
  const ferryDensePath = useMemo(() => buildFerryDensePath(ferry), [ferry])

  const cafeDenseRef = useRef<CafeDensePath[]>(cafeDensePaths)
  const ferryDenseRef = useRef<[number, number][]>(ferryDensePath)

  useEffect(() => {
    cafeDenseRef.current = cafeDensePaths
  }, [cafeDensePaths])

  useEffect(() => {
    ferryDenseRef.current = ferryDensePath
  }, [ferryDensePath])

  useEffect(() => {
    if (!containerRef.current) return

    createMap({
      container: containerRef.current,
      style: createWorldStyle(),
      center: [-0.09, 51.505],
      zoom: 4.03,
    })

    mapRef?.current?.addControl(new maplibregl.NavigationControl(), 'top-right')
  }, [createMap, mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    syncTerrain(map, terrainEnabled)
  }, [terrainEnabled, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    void (async () => {
      await syncGarageLayer(map, garages)
      if (!map.getLayer(GARAGES_LAYER_ID)) return

      map.setLayoutProperty(
        GARAGES_LAYER_ID,
        'visibility',
        garagesEnabled ? 'visible' : 'none',
      )
    })()
  }, [garages, ready, garagesEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    syncWeatherLayer(map, weather)
  }, [weather, ready, weatherEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    if (!map.getLayer(WEATHER_LAYER_ID)) return

    map.setLayoutProperty(
      WEATHER_LAYER_ID,
      'visibility',
      weatherEnabled ? 'visible' : 'none',
    )
  }, [weatherEnabled, ready, weather])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    void syncWarningsLayer(map, warnings)
  }, [warnings, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    setupFerryLayer(map, ferry)
  }, [ferry, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    void setupCafeToGarageLayer(map, cafePairs)
  }, [cafePairs, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const { drawMs, holdMs } = parityConfig.animation
    const cafesMinZoom = parityConfig.zoom.cafesMin
    const loopMs = drawMs + holdMs
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = (now - start) % loopMs
      const progress = elapsed < drawMs ? easeInOutCubic(elapsed / drawMs) : 1

      if (ferryDenseRef.current.length) {
        animateFerryLayer(map, ferryDenseRef.current, progress)
      }
      if (cafeDenseRef.current.length && map.getZoom() >= cafesMinZoom) {
        animateCafeToGarageLayer(map, cafeDenseRef.current, progress)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    syncOpenSourceBuildingsLayer(map, openBuildingsEnabled && terrainEnabled)
  }, [openBuildingsEnabled, terrainEnabled, ready])

  return (
    <>
      <div className={styles.container}>
        <MapLibreControls
          terrainEnabled={terrainEnabled}
          openBuildingsEnabled={openBuildingsEnabled}
          weatherEnabled={weatherEnabled}
          garagesEnabled={garagesEnabled}
          onToggleTerrain={() => setTerrainEnabled((prev) => !prev)}
          onToggleOpenBuildings={() => setOpenBuildingsEnabled((prev) => !prev)}
          onToggleWeather={() => setWeatherEnabled((prev) => !prev)}
          onToggleGarages={() => setGaragesEnabled((prev) => !prev)}
          className={styles.baseToggle}
          activeButtonClassName={styles.activeToggle}
        />
        <div ref={containerRef} className={styles.mapContainer} />
      </div>
      <MapViewDisplay
        map={ready ? mapRef.current : null}
        className={styles.zoomDisplay}
      />
      <TwoRoutes />
      <BathymetryLayer />
      {true && <PolygonBoxes />}
    </>
  )
}
