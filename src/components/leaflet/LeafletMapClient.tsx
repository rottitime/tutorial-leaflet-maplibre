'use client'

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  loading: () => <p>A map is loading</p>,
  ssr: false,
})

export default function LeafletMapClient() {
  return <LeafletMap />
}
