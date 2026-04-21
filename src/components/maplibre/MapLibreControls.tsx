'use client'

type BaseStyleId = 'osm' | 'basicEurope'

type Props = {
  activeBaseStyle: BaseStyleId
  terrainEnabled: boolean
  openBuildingsEnabled: boolean
  onSelectBaseStyle: (style: BaseStyleId) => void
  onToggleTerrain: () => void
  onToggleOpenBuildings: () => void
  className: string
  activeButtonClassName: string
}

export function MapLibreControls({
  activeBaseStyle,
  terrainEnabled,
  openBuildingsEnabled,
  onSelectBaseStyle,
  onToggleTerrain,
  onToggleOpenBuildings,
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
      <button
        className={openBuildingsEnabled ? activeButtonClassName : ''}
        onClick={onToggleOpenBuildings}
        type="button"
      >
        Open 3D Buildings
      </button>
    </div>
  )
}
