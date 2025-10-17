"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ExternalLink } from "lucide-react"
import type { Project } from "@/types/project"

interface ProjectDetailModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

export function ProjectDetailModal({ project, isOpen, onClose, isLoading }: ProjectDetailModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 상세 정보</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : project ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">프로젝트 이름</h3>
              <p className="text-lg font-semibold text-foreground">{project.name || "이름 없음"}</p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">생성일자</h3>
              <p className="text-foreground">{formatDate(project.createdAt)}</p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">수정일자</h3>
              <p className="text-foreground">{formatDate(project.updatedAt)}</p>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full" variant="default">
                <a
                  href={`https://dev-planner.archisketch.com/?projectId=${project._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  프로젝트 열기
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-muted-foreground">프로젝트 정보를 불러올 수 없습니다</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
