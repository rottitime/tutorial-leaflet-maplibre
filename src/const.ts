type FerryRoute = {
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

export const ferryRoutes: FerryRoute[] = [
  {
    name: 'Portsmouth to Cherbourg',
    from: {
      name: 'Portsmouth',
      position: [50.8198, -1.088],
    },
    to: {
      name: 'Cherbourg',
      position: [49.6337, -1.6221],
    },
    path: [
      [50.8198, -1.088],
      [50.6, -1.3],
      [50.2, -1.5],
      [49.9, -1.6],
      [49.6337, -1.6221],
    ],
  },
]
