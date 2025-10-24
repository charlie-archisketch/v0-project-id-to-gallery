"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { ProjectGallery } from "@/components/project-gallery"
import { ProjectDetailModal } from "@/components/project-detail-modal"
import { FloorRoomSelectionModal } from "@/components/floor-room-selection-modal"
import type { Project } from "@/types/project"
import type { FloorplanData } from "@/types/floorplan"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8080"

const fetchWithNgrok = (input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers)
  headers.set("ngrok-skip-browser-warning", "1")
  return fetch(input, { ...init, headers })
}

export default function Home() {
  const [isSearching, setIsSearching] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchedInfo, setSearchedInfo] = useState<string>("")

  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false)
  const [isLoadingFloorplan, setIsLoadingFloorplan] = useState(false)
  const [floorplanData, setFloorplanData] = useState<FloorplanData>([])
  const [currentProjectId, setCurrentProjectId] = useState<string>("")

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const handleProjectIdSearch = async (projectId: string) => {
    setCurrentProjectId(projectId)
    setIsLoadingFloorplan(true)
    setIsFloorModalOpen(true)
    setFloorplanData([])

    try {
      console.log("[v0] Fetching project details for:", projectId)
      const response = await fetchWithNgrok(`${baseUrl}/projects/${projectId}`)

      if (!response.ok) {
        throw new Error("프로젝트를 찾을 수 없습니다")
      }

      const projectData: Project = await response.json()
      console.log("[v0] Project data:", projectData)

      if (!projectData.floorplanPath) {
        throw new Error("평면도 정보가 없습니다")
      }

      console.log("[v0] Fetching floorplan from:", projectData.floorplanPath)
      const floorplanResponse = await fetchWithNgrok(projectData.floorplanPath)

      if (!floorplanResponse.ok) {
        throw new Error("평면도 정보를 불러올 수 없습니다")
      }

      const floorplanJson: FloorplanData = await floorplanResponse.json()
      console.log("[v0] Floorplan data:", floorplanJson)
      setFloorplanData(floorplanJson)
    } catch (err) {
      console.error("[v0] Error:", err)
      if (err instanceof Error && err.message.includes("fetch")) {
        console.log("[v0] Using mock floorplan data for preview")
        // Import mock data from the attachment
        try {
          const mockResponse = await fetchWithNgrok("/floorplans-mock.json")
          if (mockResponse.ok) {
            const mockData = await mockResponse.json()
            setFloorplanData(mockData)
            return
          }
        } catch {
          // Fallback to inline mock data
        }
      }

      const errorMessage = err instanceof Error ? err.message : "오류가 발생했습니다"
      setError(errorMessage)
      setIsFloorModalOpen(false)
    } finally {
      setIsLoadingFloorplan(false)
    }
  }

  const handleFloorRoomSelect = async (selection: { type: "floor" | "room"; id: string; title: string }) => {
    setIsSearching(true)
    setError(null)
    setSearchedInfo(selection.title)

    try {
      const endpoint =
        selection.type === "floor"
          ? `${baseUrl}/projects/${selection.id}/similar-floor`
          : `${baseUrl}/projects/${selection.id}/similar-room`

      console.log("[v0] Searching similar items:", endpoint)
      const response = await fetchWithNgrok(endpoint)

      if (!response.ok) {
        throw new Error(
          selection.type === "floor" ? "비슷한 프로젝트를 찾을 수 없습니다" : "비슷한 방을 찾을 수 없습니다",
        )
      }

      const data: Project[] = await response.json()
      console.log("[v0] Similar items:", data)
      setProjects(data)
    } catch (err) {
      console.error("[v0] Search error:", err)
      const errorMessage = err instanceof Error ? err.message : "오류가 발생했습니다"
      setError(errorMessage)
      setProjects([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleProjectClick = async (projectId: string) => {
    setIsLoadingDetail(true)
    setIsDetailModalOpen(true)
    setSelectedProject(null)

    try {
      console.log("[v0] Fetching project details for:", projectId)
      const response = await fetchWithNgrok(`${baseUrl}/projects/${projectId}`)

      if (!response.ok) {
        throw new Error("프로젝트 정보를 불러올 수 없습니다")
      }

      const data: Project = await response.json()
      console.log("[v0] Project details:", data)
      setSelectedProject(data)
    } catch (err) {
      console.error("[v0] Error fetching project details:", err)
      setSelectedProject(null)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            프로젝트 탐색
          </h1>
          <p className="text-lg text-muted-foreground">프로젝트 ID를 입력하여 층 또는 방을 선택하세요</p>
        </div>

        <SearchBar onSearch={handleProjectIdSearch} isLoading={isLoadingFloorplan} placeholder="프로젝트 ID 입력" />

        <ProjectGallery
          projects={projects}
          isLoading={isSearching}
          error={error}
          searchedId={searchedInfo}
          onProjectClick={handleProjectClick}
        />

        <FloorRoomSelectionModal
          isOpen={isFloorModalOpen}
          onClose={() => setIsFloorModalOpen(false)}
          floors={floorplanData}
          onSelect={handleFloorRoomSelect}
          isLoading={isLoadingFloorplan}
        />

        <ProjectDetailModal
          project={selectedProject}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          isLoading={isLoadingDetail}
        />
      </div>
    </main>
  )
}
