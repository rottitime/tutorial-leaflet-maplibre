import { useEffect, useMemo, useState } from 'react'

type LatLng = [number, number]

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Looping 0..1 progress value for route draw animations. */
export function useRouteAnimationProgress(drawMs = 2800, holdMs = 1400) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    let start: number | null = null
    const loopMs = drawMs + holdMs

    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = (now - start) % loopMs
      const t = elapsed < drawMs ? easeInOutCubic(elapsed / drawMs) : 1
      setProgress(t)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [drawMs, holdMs])

  return progress
}

/** Add extra points so animation looks smooth for long segments. */
export function densifyPath(path: LatLng[], stepsPerSegment: number) {
  if (path.length < 2) return path
  const out: LatLng[] = []

  for (let i = 0; i < path.length - 1; i++) {
    const [lat0, lng0] = path[i]
    const [lat1, lng1] = path[i + 1]
    for (let j = 0; j < stepsPerSegment; j++) {
      const t = j / stepsPerSegment
      out.push([lat0 + (lat1 - lat0) * t, lng0 + (lng1 - lng0) * t])
    }
  }

  out.push(path[path.length - 1])
  return out
}

/** Shared helper for animated polyline slices. */
export function useAnimatedPath(path: LatLng[], progress: number, stepsPerSegment = 20) {
  const dense = useMemo(() => densifyPath(path, stepsPerSegment), [path, stepsPerSegment])

  return useMemo(() => {
    if (!dense.length) return dense
    const end = Math.max(1, Math.round(progress * (dense.length - 1))) + 1
    return dense.slice(0, end)
  }, [dense, progress])
}
