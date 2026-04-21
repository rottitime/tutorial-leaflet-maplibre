export const parityConfig = {
  zoom: {
    warningsMin: 8,
    cafesMin: 9,
  },
  fetch: {
    garages: '/api/test/garages',
    cafes: '/api/test/cafes',
    warnings: '/api/test/warnings',
    weather: '/api/test/weather',
    ferries: '/api/test/ferries',
  },
  animation: {
    drawMs: 2800,
    holdMs: 1400,
  },
} as const
