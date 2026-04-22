'use client'

import { createBaseStyle } from '@/components/maplibre/mapScene'
import { densifyPath } from '@/components/maplibre/routeAnimation'
import { parityConfig } from '@/lib/parityConfig'
import { FerryRoute } from '@/types'
import { FeatureCollection, LineString } from 'geojson'
import maplibregl, { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import styles from './FerryTraceFeature.module.css'

const BASE_SOURCE_ID = 'ferry-base'
const TRACE_SOURCE_ID = 'ferry-trace'
const BASE_LAYER_ID = 'ferry-base-line'
const TRACE_LAYER_ID = 'ferry-trace-line'
const FOLLOW_ZOOM = 10
const FOLLOW_PITCH = 55
const STEP_MS = 20

function latLngPathToLngLat(path: [number, number][]) {
  return path.map(([lat, lng]) => [lng, lat] as [number, number])
}

/** Initial bearing from point a to b (both [lng, lat]), degrees 0..360. */
function bearingBetween(a: [number, number], b: [number, number]) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const lng1 = toRad(a[0])
  const lng2 = toRad(b[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export default function FerryTraceFeature() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const timerRef = useRef<number | null>(null)

  const [ready, setReady] = useState(false)
  const [route, setRoute] = useState<FerryRoute | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createBaseStyle('osm'),
      center: [-1.4, 50.2],
      zoom: 7.5,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      mapRef.current = map
      setReady(true)
    })

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    fetch(parityConfig.fetch.ferries)
      .then((r) => r.json() as Promise<FerryRoute>)
      .then((data) => {
        if (active) setRoute(data)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !route) return

    const coords = latLngPathToLngLat(route.path)

    const baseLine: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        },
      ],
    }

    const emptyTrace: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [coords[0]] },
        },
      ],
    }

    if (!map.getSource(BASE_SOURCE_ID)) {
      map.addSource(BASE_SOURCE_ID, { type: 'geojson', data: baseLine })
      map.addLayer({
        id: BASE_LAYER_ID,
        type: 'line',
        source: BASE_SOURCE_ID,
        paint: {
          'line-color': '#334155',
          'line-width': 2,
          'line-opacity': 0.35,
          'line-dasharray': [2, 2],
        },
      })
    }

    if (!map.getSource(TRACE_SOURCE_ID)) {
      map.addSource(TRACE_SOURCE_ID, { type: 'geojson', data: emptyTrace })
      map.addLayer({
        id: TRACE_LAYER_ID,
        type: 'line',
        source: TRACE_SOURCE_ID,
        paint: {
          'line-color': '#eab308',
          'line-width': 5,
          'line-opacity': 0.9,
        },
      })
    }

    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0]),
    )
    map.fitBounds(bounds, { padding: 60, duration: 0 })
  }, [ready, route])

  const startTrace = () => {
    const map = mapRef.current
    if (!map || !route || running) return

    const coords = latLngPathToLngLat(route.path)
    const dense = densifyPath(route.path, 40).map(
      ([lat, lng]) => [lng, lat] as [number, number],
    )
    if (dense.length < 2) return

    const trace: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [dense[0]] },
        },
      ],
    }
    ;(map.getSource(TRACE_SOURCE_ID) as maplibregl.GeoJSONSource).setData(
      trace,
    )

    const initialBearing = bearingBetween(dense[0], dense[1])
    map.jumpTo({
      center: dense[0],
      zoom: FOLLOW_ZOOM,
      bearing: initialBearing,
      pitch: FOLLOW_PITCH,
    })
    setRunning(true)

    let i = 1
    timerRef.current = window.setInterval(() => {
      const source = map.getSource(
        TRACE_SOURCE_ID,
      ) as maplibregl.GeoJSONSource | undefined
      if (!source) return

      if (i < dense.length) {
        trace.features[0].geometry.coordinates.push(dense[i])
        source.setData(trace)

        const next = dense[Math.min(i + 1, dense.length - 1)]
        const bearing = bearingBetween(dense[i], next)
        map.easeTo({
          center: dense[i],
          bearing,
          pitch: FOLLOW_PITCH,
          duration: STEP_MS,
          essential: true,
        })
        i++
      } else if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
        setRunning(false)
      }
    }, STEP_MS)
  }

  const resetTrace = () => {
    const map = mapRef.current
    if (!map || !route) return

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    const coords = latLngPathToLngLat(route.path)
    const source = map.getSource(TRACE_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [coords[0]] },
          },
        ],
      })
    }

    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0]),
    )
    map.easeTo({ bearing: 0, pitch: 0, duration: 400 })
    map.fitBounds(bounds, { padding: 60, duration: 600 })
    setRunning(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={startTrace}
          disabled={!ready || !route || running}
        >
          {running ? 'Running…' : 'Start ferry trace'}
        </button>
        <button
          type="button"
          onClick={resetTrace}
          disabled={!ready || !route}
        >
          Reset
        </button>
      </div>
      {route && (
        <p className={styles.hint}>
          Route: {route.from.name} → {route.to.name}
        </p>
      )}
      <div ref={containerRef} className={styles.mapContainer} />
    </div>
  )
}
