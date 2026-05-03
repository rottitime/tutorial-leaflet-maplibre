export const parityConfig = {
  zoom: {
    warningsMin: 8,
    cafesMin: 9,
    openBuildingsMin: 15,
  },
  fetch: {
    garages: '/api/test/garages',
    cafes: '/api/test/cafes',
    warnings: '/api/test/warnings',
    weather: '/api/test/weather',
    ferries: '/api/test/ferries',
    twoRoutes: '/api/test/two-routes',
    polygonBoxes: '/api/test/polygon-boxes',
  },
  animation: {
    drawMs: 2800,
    holdMs: 1400,
  },
} as const
