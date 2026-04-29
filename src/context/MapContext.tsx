'use client'
import { Map } from 'maplibre-gl'
import { createContext } from 'react'

const MapContext = createContext<Map | undefined>(undefined)

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  return <MapContext.Provider value={undefined}>{children}</MapContext.Provider>
}
