'use client'
import maplibregl, { type Map, type MapOptions } from 'maplibre-gl'
import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

type MapRef = RefObject<Map | null>

type Props = {
  mapRef: MapRef
  ready: boolean
  createMap: (options: MapOptions) => () => void // returns
}

const MapContext = createContext<Props | undefined>(undefined)

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const mapRef = useRef<MapRef['current']>(null)
  const [ready, setReady] = useState(false)

  const cleanup = () => {
    mapRef.current?.remove()
    mapRef.current = null
    setReady(false)
  }

  const createMap = useCallback((options: MapOptions) => {
    if (mapRef.current) return () => {}
    const map = new maplibregl.Map(options)
    mapRef.current = map
    map.on('load', () => setReady(true))

    return () => cleanup()
  }, [])

  return (
    <MapContext.Provider value={{ mapRef, createMap, ready }}>
      {children}
    </MapContext.Provider>
  )
}

export const useMap = () => {
  const context = useContext(MapContext)

  if (!context) throw new Error('useMap must be used within a MapProvider')

  return context
}
