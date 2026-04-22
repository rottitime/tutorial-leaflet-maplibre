import FerryTraceClient from '@/components/maplibre/features/FerryTraceClient'
import Link from 'next/link'

export default function FerryTracePage() {
  return (
    <div>
      <p>
        <Link href="/maplibre/features">← Back to features</Link>
      </p>
      <h1>Ferry trace (live feature update)</h1>
      <p>
        Click <em>Start ferry trace</em> to progressively extend a GeoJSON
        LineString along the ferry route, calling{' '}
        <code>source.setData()</code> on each tick.
      </p>
      <FerryTraceClient />
    </div>
  )
}
