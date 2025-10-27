"use client"

import type React from "react"
import { useState } from "react"
import { Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SearchBarProps {
  onSearch: (id: string) => void
  onFileUpload: (file: File) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, onFileUpload, isLoading }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("")
  const [searchMode, setSearchMode] = useState<"id" | "upload">("id")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchMode === "id" && inputValue.trim()) {
      onSearch(inputValue.trim())
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/json") {
      onFileUpload(file)
      // Reset the input so the same file can be uploaded again
      e.target.value = ""
    } else if (file) {
      alert("JSON 파일만 업로드 가능합니다")
    }
  }

  return (
    <div className="mx-auto mb-16 max-w-2xl">
      <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as "id" | "upload")} className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="id">프로젝트 ID</TabsTrigger>
          <TabsTrigger value="upload">JSON 업로드</TabsTrigger>
        </TabsList>
      </Tabs>

      {searchMode === "id" ? (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="프로젝트 ID 입력"
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
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Upload className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="h-12 pl-10 text-base file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-1 file:text-sm file:font-medium file:text-primary-foreground"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
