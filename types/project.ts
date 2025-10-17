export interface Project {
  _id?: string
  id?: string // Added for room API
  userId: string
  name?: string // Made optional for floor API
  projectName?: string // Added for room API
  enterpriseId?: string
  directoryIds?: string[]
  teamDirectoryIds?: string[]
  coverImage: string
  defaultCoverImage: string
  floorplanPath?: string // Added for fetching floorplan data
  state: number
  bookmark?: boolean
  createdAt: string
  updatedAt: string
  projectId?: string // Added for room API
}
