'use client'

import { useEffect, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

export function useFetchJson<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback)

  useEffect(() => {
    let active = true

    const load = async () => {
      const response = await fetch(url)
      const json = (await response.json()) as T
      if (active) setData(json)
    }

    load().catch(() => {
      if (active) setData(fallback)
    })

    return () => {
      active = false
    }
  }, [url])

  return data
}

export function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap()

  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])

  useMapEvents({
    zoomend(e) {
      onZoom(e.target.getZoom())
    },
  })

  return null
}
