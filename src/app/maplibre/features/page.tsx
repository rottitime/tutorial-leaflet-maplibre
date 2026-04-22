import Link from 'next/link'

export default function MapLibreFeaturesPage() {
  return (
    <div>
      <h1>MapLibre features</h1>
      <p>Small isolated demos of individual MapLibre capabilities.</p>
      <ul>
        <li>
          <Link href="/maplibre/features/game-controls">
            Game-like keyboard controls
          </Link>
          <span> — arrow keys pan & rotate the map.</span>
        </li>
        <li>
          <Link href="/maplibre/features/ferry-trace">
            Ferry trace (live feature update)
          </Link>
          <span> — progressively extend a line along the ferry route.</span>
        </li>
      </ul>
    </div>
  )
}
