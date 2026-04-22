import GameControlsClient from '@/components/maplibre/features/GameControlsClient'
import Link from 'next/link'

export default function GameControlsPage() {
  return (
    <div>
      <p>
        <Link href="/maplibre/features">← Back to features</Link>
      </p>
      <h1>Game-like keyboard controls</h1>
      <p>
        Terrain and 3D buildings are on by default. Click{' '}
        <em>Enable game controls</em>, then use the arrow keys.
      </p>
      <GameControlsClient />
    </div>
  )
}
