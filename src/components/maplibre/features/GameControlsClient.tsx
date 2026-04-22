'use client'

import dynamic from 'next/dynamic'

const GameControlsFeature = dynamic(() => import('./GameControlsFeature'), {
  loading: () => <p>Loading map…</p>,
  ssr: false,
})

export default function GameControlsClient() {
  return <GameControlsFeature />
}
