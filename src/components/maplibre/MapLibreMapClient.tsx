'use client'

import dynamic from 'next/dynamic'

const MapLibreMap = dynamic(() => import('./MapLibreMap'), {
  loading: () => <p>A map is loading</p>,
  ssr: false,
})

export default function MapLibreMapClient() {
  return <MapLibreMap />
}
