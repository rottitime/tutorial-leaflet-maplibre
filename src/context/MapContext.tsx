'use client'
import { Map } from 'maplibre-gl'
import { createContext, useContext } from 'react'

const MapContext = createContext<Map | undefined>(undefined)

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  return <MapContext.Provider value={undefined}>{children}</MapContext.Provider>
}

export const useMap = () => {
  const context = useContext(MapContext)

  if (!context) throw new Error('useMap must be used within a MapProvider')

  return context
}
