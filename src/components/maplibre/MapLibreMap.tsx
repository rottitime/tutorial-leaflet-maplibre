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
import { useFetchJson, useMapCenter, useMapZoom } from './mapClientUtils'
import { MapLibreControls } from './MapLibreControls'
import styles from './MapLibreMap.module.css'
import { BaseStyleId, createBaseStyle, syncTerrain } from './mapScene'
import { syncOpenSourceBuildingsLayer } from './OpenSourceBuildingsLayer'
import { easeInOutCubic } from './routeAnimation'
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
  const center = useMapCenter(mapRef.current)

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
  const cafesVisibleRef = useRef(false)

  useEffect(() => {
    cafeDenseRef.current = cafeDensePaths
  }, [cafeDensePaths])

  useEffect(() => {
    ferryDenseRef.current = ferryDensePath
  }, [ferryDensePath])

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

    setupFerryLayer(map, ferry)
  }, [ferry, ready, activeBaseStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const cafesVisible = zoom >= parityConfig.zoom.cafesMin
    cafesVisibleRef.current = cafesVisible
    void setupCafeToGarageLayer(map, cafePairs, cafesVisible)
  }, [cafePairs, zoom, ready, activeBaseStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const { drawMs, holdMs } = parityConfig.animation
    const loopMs = drawMs + holdMs
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = (now - start) % loopMs
      const progress =
        elapsed < drawMs ? easeInOutCubic(elapsed / drawMs) : 1

      if (ferryDenseRef.current.length) {
        animateFerryLayer(map, ferryDenseRef.current, progress)
      }
      if (cafesVisibleRef.current && cafeDenseRef.current.length) {
        animateCafeToGarageLayer(map, cafeDenseRef.current, progress)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready, activeBaseStyle])

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
      <p className={styles.zoomDisplay}>
        Zoom: {zoom.toFixed(2)} · Center: {center.lat.toFixed(4)},{' '}
        {center.lng.toFixed(4)}
      </p>
    </>
  )
}
