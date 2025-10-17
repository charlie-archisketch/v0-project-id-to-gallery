"use client"

import type React from "react"
import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  onSearch: (id: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function SearchBar({ onSearch, isLoading, placeholder }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mb-16 max-w-2xl">
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
    </form>
  )
}
