"use client"

import { ProjectCard } from "@/components/project-card"
import { Spinner } from "@/components/ui/spinner"
import type { Project } from "@/types/project"

interface ProjectGalleryProps {
  projects: Project[]
  isLoading?: boolean
  error?: string | null
  searchedId?: string
  onProjectClick?: (projectId: string) => void
}

export function ProjectGallery({ projects, isLoading, error, searchedId, onProjectClick }: ProjectGalleryProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4 size-8" />
          <p className="text-muted-foreground">비슷한 항목을 찾는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (!searchedId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">프로젝트 ID를 입력하여 층 또는 방을 선택하세요</p>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">비슷한 항목을 찾을 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          <span className="font-mono">{searchedId}</span>
          <span className="text-muted-foreground">와 비슷한 항목</span>
        </h2>
        <p className="text-sm text-muted-foreground">{projects.length}개의 결과</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectIdToFetch = project.projectId || project._id
          return (
            <ProjectCard
              key={project._id || project.id}
              project={project}
              onClick={() => onProjectClick?.(projectIdToFetch)}
            />
          )
        })}
      </div>
    </div>
  )
}
