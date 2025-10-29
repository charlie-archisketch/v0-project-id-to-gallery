"use client"

import type React from "react"
import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchBarProps {
  onSearch: (id: string, areaFrom?: number, areaTo?: number) => void
  isLoading?: boolean
  placeholder?: string
}

export function SearchBar({ onSearch, isLoading, placeholder }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [areaFrom, setAreaFrom] = useState<string>("")
  const [areaTo, setAreaTo] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const areaFromNum = areaFrom ? Number.parseInt(areaFrom, 10) : undefined
      const areaToNum = areaTo ? Number.parseInt(areaTo, 10) : undefined
      onSearch(inputValue.trim(), areaFromNum, areaToNum)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-16 max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder || "프로젝트 ID 입력"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-12 pl-10 text-base"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? "검색 중..." : "검색"}
          </Button>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="areaFrom" className="text-sm text-muted-foreground">
              면적 필터 (선택)
            </Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="areaFrom"
                type="number"
                placeholder="최소 면적"
                value={areaFrom}
                onChange={(e) => setAreaFrom(e.target.value)}
                className="h-10"
                disabled={isLoading}
                min="0"
                step="1"
              />
              <span className="text-muted-foreground">~</span>
              <Input
                id="areaTo"
                type="number"
                placeholder="최대 면적"
                value={areaTo}
                onChange={(e) => setAreaTo(e.target.value)}
                className="h-10"
                disabled={isLoading}
                min="0"
                step="1"
              />
              <span className="text-sm text-muted-foreground">m²</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
