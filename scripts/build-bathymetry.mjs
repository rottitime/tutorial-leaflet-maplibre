#!/usr/bin/env node
// Crop Natural Earth bathymetry polygons to a UK bbox.
// Inputs (downloaded once to /tmp by the user/agent):
//   /tmp/ne_K_200.geojson    (sea deeper than 200 m)
//   /tmp/ne_J_1000.geojson   (sea deeper than 1000 m)
// Outputs:
//   public/data/bathymetry-200m.geojson
//   public/data/bathymetry-1000m.geojson

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// UK + surrounding waters
const UK_BBOX = { minLng: -15, minLat: 45, maxLng: 5, maxLat: 63 }

function featureBbox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      return
    }
    for (const c of coords) visit(c)
  }
  visit(geometry.coordinates)
  return { minX, minY, maxX, maxY }
}

function overlapsUk(bb) {
  return !(
    bb.maxX < UK_BBOX.minLng ||
    bb.minX > UK_BBOX.maxLng ||
    bb.maxY < UK_BBOX.minLat ||
    bb.minY > UK_BBOX.maxLat
  )
}

function crop(inPath, outPath, depthM) {
  const src = JSON.parse(readFileSync(inPath, 'utf8'))
  const features = src.features
    .filter((f) => overlapsUk(featureBbox(f.geometry)))
    .map((f) => ({
      ...f,
      properties: { depth_m: depthM },
    }))
  const out = { type: 'FeatureCollection', features }
  const json = JSON.stringify(out)
  writeFileSync(outPath, json)
  console.log(
    `Wrote ${features.length} features (${(json.length / 1024).toFixed(1)} KB) to ${outPath}`,
  )
}

crop(
  '/tmp/ne_K_200.geojson',
  resolve(root, 'public/data/bathymetry-200m.geojson'),
  200,
)
crop(
  '/tmp/ne_J_1000.geojson',
  resolve(root, 'public/data/bathymetry-1000m.geojson'),
  1000,
)
