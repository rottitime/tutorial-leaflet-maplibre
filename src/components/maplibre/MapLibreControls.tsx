'use client'

type Props = {
  terrainEnabled: boolean
  openBuildingsEnabled: boolean
  weatherEnabled: boolean
  garagesEnabled: boolean
  onToggleTerrain: () => void
  onToggleOpenBuildings: () => void
  onToggleWeather: () => void
  onToggleGarages: () => void
  className: string
  activeButtonClassName: string
}

export function MapLibreControls({
  terrainEnabled,
  openBuildingsEnabled,
  weatherEnabled,
  garagesEnabled,
  onToggleTerrain,
  onToggleOpenBuildings,
  onToggleWeather,
  onToggleGarages,
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
      <button
        className={weatherEnabled ? activeButtonClassName : ''}
        onClick={onToggleWeather}
        type="button"
      >
        Weather
      </button>
      <button
        className={garagesEnabled ? activeButtonClassName : ''}
        onClick={onToggleGarages}
        type="button"
      >
        Garages
      </button>
    </div>
  )
}
