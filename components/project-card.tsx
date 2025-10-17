"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
  onClick?: (projectId: string) => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const displayName = project.name || project.projectName || "Untitled"

  const handleClick = () => {
    if (onClick) {
      onClick(project._id)
    }
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:border-muted-foreground/50"
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={project.coverImage || "/placeholder.svg?height=400&width=600"}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-balance text-lg font-semibold leading-tight text-foreground">{displayName}</h3>
      </CardContent>
    </Card>
  )
}
