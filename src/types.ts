export type FerryRoute = {
  name: string
  from: {
    name: string
    position: [number, number]
  }
  to: {
    name: string
    position: [number, number]
  }
  path: [number, number][]
}
