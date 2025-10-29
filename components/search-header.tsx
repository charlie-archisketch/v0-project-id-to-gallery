"use client"

import type React from "react"
import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchHeaderProps {
  onSearch: (id: string, areaFrom?: number, areaTo?: number) => void
  isLoading?: boolean
}

export function SearchHeader({ onSearch, isLoading }: SearchHeaderProps) {
  const [projectId, setProjectId] = useState("")
  const [areaFrom, setAreaFrom] = useState<string>("")
  const [areaTo, setAreaTo] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectId.trim()) {
      const areaFromNum = areaFrom ? Number.parseInt(areaFrom, 10) : undefined
      const areaToNum = areaTo ? Number.parseInt(areaTo, 10) : undefined
      onSearch(projectId.trim(), areaFromNum, areaToNum)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex items-center gap-4 py-3">
          <div className="flex items-center gap-2">
            <label htmlFor="projectId" className="whitespace-nowrap text-sm text-zinc-400">
              프로젝트 ID:
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="projectId"
                type="text"
                placeholder="ID 입력"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="h-9 w-48 border-zinc-700 bg-zinc-800 pl-9 text-sm text-white placeholder:text-zinc-500"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-zinc-400">면적 범위:</label>
            <Input
              type="number"
              placeholder="최소"
              value={areaFrom}
              onChange={(e) => setAreaFrom(e.target.value)}
              className="h-9 w-24 border-zinc-700 bg-zinc-800 text-sm text-white placeholder:text-zinc-500"
              disabled={isLoading}
              min="0"
              step="1"
            />
            <span className="text-zinc-500">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={areaTo}
              onChange={(e) => setAreaTo(e.target.value)}
              className="h-9 w-24 border-zinc-700 bg-zinc-800 text-sm text-white placeholder:text-zinc-500"
              disabled={isLoading}
              min="0"
              step="1"
            />
            <span className="text-sm text-zinc-500">m²</span>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !projectId.trim()}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "검색 중..." : "검색"}
          </Button>
        </form>
      </div>
    </header>
  )
}
