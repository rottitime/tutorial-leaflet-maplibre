'use client'

import dynamic from 'next/dynamic'

const FerryTraceFeature = dynamic(() => import('./FerryTraceFeature'), {
  loading: () => <p>Loading map…</p>,
  ssr: false,
})

export default function FerryTraceClient() {
  return <FerryTraceFeature />
}
