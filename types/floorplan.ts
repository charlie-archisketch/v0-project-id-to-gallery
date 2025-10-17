export interface FloorplanCorner {
  archiId: string
  position: {
    x: number
    y: number
    z: number
  }
}

export interface FloorplanRoom {
  archiId: string
  title: string
  area: number
  type: string
  corners: FloorplanCorner[]
}

export interface Floor {
  id: string
  archiId: string
  title: string
  area: number
  rooms: FloorplanRoom[]
  floorplanImage: string | null
  dimensions: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
  }
  corners: FloorplanCorner[]
}

export type FloorplanData = Floor[]
