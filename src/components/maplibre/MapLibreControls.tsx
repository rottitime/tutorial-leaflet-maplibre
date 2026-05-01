'use client'

type Props = {
  terrainEnabled: boolean
  openBuildingsEnabled: boolean
  onToggleTerrain: () => void
  onToggleOpenBuildings: () => void
  className: string
  activeButtonClassName: string
}

export function MapLibreControls({
  terrainEnabled,
  openBuildingsEnabled,
  onToggleTerrain,
  onToggleOpenBuildings,
  className,
  activeButtonClassName,
}: Props) {
  return (
    <div className={className}>
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
