"use client"

import { useState, useMemo } from "react"
import type { Floor, FloorplanRoom } from "@/types/floorplan"
import { cn } from "@/lib/utils"

interface FloorplanVisualizerProps {
  floor: Floor
  onRoomClick: (room: FloorplanRoom) => void
  onFloorClick: () => void
}

export function FloorplanVisualizer({ floor, onRoomClick, onFloorClick }: FloorplanVisualizerProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)

  const { viewBox, scale, offset } = useMemo(() => {
    console.log("[v0] Floor data:", floor)
    console.log("[v0] Floor corners:", floor.corners)
    console.log("[v0] Floor rooms:", floor.rooms)

    // Filter out invalid corners and ensure they have the required position property
    const validFloorCorners = (floor.corners || []).filter(
      (c) => c && c.position && typeof c.position.x === "number" && typeof c.position.z === "number",
    )

    const validRoomCorners = (floor.rooms || []).flatMap((room) =>
      (room.corners || []).filter(
        (c) => c && c.position && typeof c.position.x === "number" && typeof c.position.z === "number",
      ),
    )

    const allCorners = [...validFloorCorners, ...validRoomCorners]

    console.log("[v0] Valid corners count:", allCorners.length)

    if (allCorners.length === 0) {
      console.warn("[v0] No valid corners found, using default viewBox")
      return { viewBox: "0 0 100 100", scale: 1, offset: { x: 0, z: 0 } }
    }

    const xCoords = allCorners.map((c) => c.position.x)
    const zCoords = allCorners.map((c) => c.position.z)

    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minZ = Math.min(...zCoords)
    const maxZ = Math.max(...zCoords)

    const width = maxX - minX
    const height = maxZ - minZ

    const padding = Math.max(width, height) * 0.1
    const viewBoxWidth = width + padding * 2
    const viewBoxHeight = height + padding * 2

    return {
      viewBox: `${minX - padding} ${minZ - padding} ${viewBoxWidth} ${viewBoxHeight}`,
      scale: Math.min(viewBoxWidth, viewBoxHeight) / 100,
      offset: { x: minX, z: minZ },
    }
  }, [floor])

  const floorPolygonPoints = useMemo(() => {
    const validCorners = (floor.corners || []).filter(
      (c) => c && c.position && typeof c.position.x === "number" && typeof c.position.z === "number",
    )
    return validCorners.map((corner) => `${corner.position.x},${corner.position.z}`).join(" ")
  }, [floor.corners])

  const getRoomPolygonPoints = (room: FloorplanRoom) => {
    const validCorners = (room.corners || []).filter(
      (c) => c && c.position && typeof c.position.x === "number" && typeof c.position.z === "number",
    )
    return validCorners.map((corner) => `${corner.position.x},${corner.position.z}`).join(" ")
  }

  const getRoomCenter = (room: FloorplanRoom) => {
    const validCorners = (room.corners || []).filter(
      (c) => c && c.position && typeof c.position.x === "number" && typeof c.position.z === "number",
    )

    if (validCorners.length === 0) return { x: 0, z: 0 }

    const sumX = validCorners.reduce((sum, c) => sum + c.position.x, 0)
    const sumZ = validCorners.reduce((sum, c) => sum + c.position.z, 0)

    return {
      x: sumX / validCorners.length,
      z: sumZ / validCorners.length,
    }
  }

  const validRooms = (floor.rooms || []).filter((room) => {
    const validCorners = (room.corners || []).filter(
      (c) => c && c.position && typeof c.position.x === "number" && typeof c.position.z === "number",
    )
    return validCorners.length >= 3 // Need at least 3 corners to make a polygon
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{floor.title}</h3>
        <button
          onClick={onFloorClick}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          층 전체 선택
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <svg viewBox={viewBox} className="h-auto w-full" style={{ maxHeight: "500px" }}>
          {floorPolygonPoints && (
            <polygon
              points={floorPolygonPoints}
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth={scale * 2}
              className="cursor-pointer transition-colors hover:fill-muted/80"
              onClick={onFloorClick}
            />
          )}

          {validRooms.map((room) => {
            const center = getRoomCenter(room)
            const isHovered = hoveredRoom === room.archiId
            const polygonPoints = getRoomPolygonPoints(room)

            if (!polygonPoints) return null

            return (
              <g key={room.archiId}>
                <polygon
                  points={polygonPoints}
                  fill={isHovered ? "hsl(var(--primary) / 0.3)" : "hsl(var(--background))"}
                  stroke="hsl(var(--primary))"
                  strokeWidth={scale * (isHovered ? 3 : 1.5)}
                  className="cursor-pointer transition-all"
                  onClick={() => onRoomClick(room)}
                  onMouseEnter={() => setHoveredRoom(room.archiId)}
                  onMouseLeave={() => setHoveredRoom(null)}
                />

                <text
                  x={center.x}
                  y={center.z}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={scale * 8}
                  fill="hsl(var(--foreground))"
                  className="pointer-events-none select-none font-medium"
                  style={{
                    textShadow: "0 0 3px hsl(var(--background))",
                  }}
                >
                  {room.title}
                </text>

                <text
                  x={center.x}
                  y={center.z + scale * 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={scale * 6}
                  fill="hsl(var(--muted-foreground))"
                  className="pointer-events-none select-none"
                  style={{
                    textShadow: "0 0 3px hsl(var(--background))",
                  }}
                >
                  {room.area.toFixed(1)}m²
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {validRooms.map((room) => (
          <button
            key={room.archiId}
            onClick={() => onRoomClick(room)}
            onMouseEnter={() => setHoveredRoom(room.archiId)}
            onMouseLeave={() => setHoveredRoom(null)}
            className={cn(
              "rounded-md border p-3 text-left transition-colors",
              hoveredRoom === room.archiId ? "border-primary bg-primary/10" : "hover:border-primary/50 hover:bg-accent",
            )}
          >
            <p className="font-medium">{room.title}</p>
            <p className="text-sm text-muted-foreground">
              {room.type} · {room.area.toFixed(2)}m²
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
