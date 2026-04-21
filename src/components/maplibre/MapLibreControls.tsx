'use client'

type BaseStyleId = 'osm' | 'basicEurope'

type Props = {
  activeBaseStyle: BaseStyleId
  terrainEnabled: boolean
  onSelectBaseStyle: (style: BaseStyleId) => void
  onToggleTerrain: () => void
  className: string
  activeButtonClassName: string
}

export function MapLibreControls({
  activeBaseStyle,
  terrainEnabled,
  onSelectBaseStyle,
  onToggleTerrain,
  className,
  activeButtonClassName,
}: Props) {
  return (
    <div className={className}>
      <button
        className={activeBaseStyle === 'osm' ? activeButtonClassName : ''}
        onClick={() => onSelectBaseStyle('osm')}
        type="button"
      >
        OpenStreetMap
      </button>
      <button
        className={activeBaseStyle === 'basicEurope' ? activeButtonClassName : ''}
        onClick={() => onSelectBaseStyle('basicEurope')}
        type="button"
      >
        Basic Europe
      </button>
      <button
        className={terrainEnabled ? activeButtonClassName : ''}
        onClick={onToggleTerrain}
        type="button"
      >
        Terrain
      </button>
    </div>
  )
}
