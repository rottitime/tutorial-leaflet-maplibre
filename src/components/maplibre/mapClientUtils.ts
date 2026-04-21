'use client'

import maplibregl, { GeoJSONSource, Map } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'

export function useFetchJson<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const fallbackRef = useRef(fallback)

  useEffect(() => {
    fallbackRef.current = fallback
  }, [fallback])

  useEffect(() => {
    let active = true

    const load = async () => {
      const response = await fetch(url)
      const json = (await response.json()) as T
      if (active) setData(json)
    }

    load().catch(() => {
      if (active) setData(fallbackRef.current)
    })

    return () => {
      active = false
    }
  }, [url])

  return data
}

export function useMapZoom(map: Map | null) {
  const [zoom, setZoom] = useState(0)

  useEffect(() => {
    if (!map) return
    const sync = () => setZoom(map.getZoom())
    sync()
    map.on('zoomend', sync)
    return () => {
      map.off('zoomend', sync)
    }
  }, [map])

  return zoom
}

export function upsertGeoJsonSource(map: Map, sourceId: string, data: GeoJSON.FeatureCollection | GeoJSON.Feature) {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined
  if (source) {
    source.setData(data)
    return
  }

  map.addSource(sourceId, {
    type: 'geojson',
    data,
  })
}

export async function ensureImage(map: Map, imageId: string, url: string) {
  if (map.hasImage(imageId)) return
  const image = await map.loadImage(url)
  // Guard against concurrent callers racing between hasImage() and addImage().
  if (map.hasImage(imageId)) return
  try {
    map.addImage(imageId, image.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes(`"${imageId}" already exists`)) {
      throw error
    }
  }
}

export function ensureLayer(map: Map, layer: maplibregl.LayerSpecification) {
  if (map.getLayer(layer.id)) return
  map.addLayer(layer)
}
