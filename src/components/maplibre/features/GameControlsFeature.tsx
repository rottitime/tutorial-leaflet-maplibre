'use client'

import { createBaseStyle, syncTerrain } from '@/components/maplibre/mapScene'
import { syncOpenSourceBuildingsLayer } from '@/components/maplibre/OpenSourceBuildingsLayer'
import maplibregl, { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import styles from './GameControlsFeature.module.css'

const PAN_PIXELS = 100
const ROTATE_DEGREES = 25

function easing(t: number) {
  return t * (2 - t)
}

export default function GameControlsFeature() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const [ready, setReady] = useState(false)
  const [gameControlsEnabled, setGameControlsEnabled] = useState(true)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createBaseStyle('osm'),
      center: [-0.1143, 51.5033],
      zoom: 17,
      bearing: -12,
      pitch: 60,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      mapRef.current = map
      syncTerrain(map, true)
      syncOpenSourceBuildingsLayer(map, true)
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
    if (!map || !ready || !gameControlsEnabled) return

    map.keyboard.disable()

    const canvas = map.getCanvas()
    canvas.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key !== 'ArrowUp' &&
        e.key !== 'ArrowDown' &&
        e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowRight'
      ) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'ArrowUp') {
        map.panBy([0, -PAN_PIXELS], { easing })
      } else if (e.key === 'ArrowDown') {
        map.panBy([0, PAN_PIXELS], { easing })
      } else if (e.key === 'ArrowLeft') {
        map.easeTo({ bearing: map.getBearing() - ROTATE_DEGREES, easing })
      } else if (e.key === 'ArrowRight') {
        map.easeTo({ bearing: map.getBearing() + ROTATE_DEGREES, easing })
      }
    }

    canvas.addEventListener('keydown', onKeyDown, true)
    return () => {
      canvas.removeEventListener('keydown', onKeyDown, true)
      map.keyboard.enable()
    }
  }, [ready, gameControlsEnabled])

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button
          type="button"
          className={gameControlsEnabled ? styles.activeToggle : ''}
          onClick={() => setGameControlsEnabled((prev) => !prev)}
        >
          {gameControlsEnabled
            ? 'Disable game controls'
            : 'Enable game controls'}
        </button>
      </div>
      {gameControlsEnabled && (
        <p className={styles.hint}>
          Focus the map, then use arrow keys: ↑/↓ pan, ←/→ rotate.
        </p>
      )}
      <div ref={containerRef} className={styles.mapContainer} />
    </div>
  )
}
