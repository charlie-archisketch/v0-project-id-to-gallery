"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Floor, FloorplanRoom } from "@/types/floorplan"

interface RoomGeometry {
  room: FloorplanRoom
  points: { x: number; z: number }[]
  center: { x: number; z: number }
}

interface WorldBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

interface ViewTransform {
  scale: number
  tx: number
  tz: number
}

const ROOM_FILL_COLOR = "rgba(148, 163, 184, 0.18)"
const ROOM_FILL_COLOR_HOVER = "rgba(59, 130, 246, 0.35)"
const ROOM_STROKE_COLOR = "rgba(59, 130, 246, 0.85)"
const ROOM_STROKE_WIDTH = 2
const ROOM_STROKE_WIDTH_HOVER = 2.5
const ROOM_STROKE_WIDTH_SELECTED = 3

const ROOM_TYPE_LABELS: Record<number, string> = {
  0: "NONE",
  1: "거실",
  2: "다이닝",
  3: "주방",
  4: "침실",
  5: "욕실",
  6: "화장실",
  7: "오피스",
  8: "복도",
  9: "다용도실",
  10: "저장고",
  11: "벽장",
  12: "랜딩",
  13: "다락방",
  14: "발코니",
  15: "정원",
  16: "파티오",
  17: "주차장",
  18: "현관",
  19: "차고",
  20: "헛간",
  21: "조형 기둥",
  22: "기둥",
  23: "드레스룸",
  24: "붙박이장",
  25: "거실&다이닝",
  26: "미팅룸",
  27: "테라스",
  28: "아이방",
  29: "지하층",
  1000: "임원공간",
  1001: "업무공간",
  1002: "회의공간",
  1003: "소셜공간",
  1004: "지원공간",
  1005: "제외공간",
  1100: "거실",
  1101: "주방",
  1102: "침실",
  1103: "서재",
  1104: "아이방",
  1105: "다용도실",
  1106: "드레스룸",
  1107: "팬트리",
  1108: "다락방",
  1109: "욕실",
  1110: "화장실",
  1111: "테라스",
  1112: "현관",
  1113: "복도",
}

function samePoint(a?: { x: number; z: number } | null, b?: { x: number; z: number } | null) {
  return !!a && !!b && a.x === b.x && a.z === b.z
}

function centroid(points: { x: number; z: number }[]): { x: number; z: number } {
  if (points.length === 0) return { x: 0, z: 0 }
  const sum = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, z: acc.z + point.z }),
    { x: 0, z: 0 },
  )
  return { x: sum.x / points.length, z: sum.z / points.length }
}

function pointInPolygon(px: number, pz: number, polygon: { x: number; z: number }[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]?.x ?? 0
    const zi = polygon[i]?.z ?? 0
    const xj = polygon[j]?.x ?? 0
    const zj = polygon[j]?.z ?? 0
    const intersects = zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / ((zj - zi) || 1e-12) + xi
    if (intersects) inside = !inside
  }
  return inside
}

export function FloorplanVisualizer({
  floor,
  selectedRoomId = null,
  onRoomSelect,
}: FloorplanVisualizerProps) {
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<ViewTransform>({ scale: 1, tx: 0, tz: 0 })
  const hoveredRoomRef = useRef<string | null>(null)

  const geometry = useMemo(() => buildFloorGeometry(floor), [floor])

  useEffect(() => {
    setHoveredRoomId(null)
  }, [floor.id])

  useEffect(() => {
    hoveredRoomRef.current = hoveredRoomId
  }, [hoveredRoomId])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !geometry?.world) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const view = fitView(rect.width, rect.height, geometry.world)
    viewRef.current = view

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawCanvas(
      ctx,
      canvas,
      geometry.rooms,
      geometry.world,
      view,
      hoveredRoomRef.current,
      selectedRoomId,
    )
  }, [geometry, selectedRoomId])

  useEffect(() => {
    resizeCanvas()
  }, [resizeCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !geometry?.world) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    drawCanvas(
      ctx,
      canvas,
      geometry.rooms,
      geometry.world,
      viewRef.current,
      hoveredRoomId,
      selectedRoomId,
    )
  }, [geometry, hoveredRoomId, selectedRoomId])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !geometry?.world) return

    const observer = new ResizeObserver(() => {
      resizeCanvas()
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [geometry, resizeCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !geometry?.world) return

    const handleMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const sx = event.clientX - rect.left
      const sy = event.clientY - rect.top
      const { world } = geometry
      const view = viewRef.current
      const wx = toWorldX(sx, view, world)
      const wz = toWorldZ(sy, view, world)
      const room = pickRoomGeometry(wx, wz, geometry.rooms)
      setHoveredRoomId(room?.room.archiId ?? null)
    }

    const handleLeave = () => {
      setHoveredRoomId(null)
    }

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const sx = event.clientX - rect.left
      const sy = event.clientY - rect.top
      const { world } = geometry
      const view = viewRef.current
      const wx = toWorldX(sx, view, world)
      const wz = toWorldZ(sy, view, world)
      const room = pickRoomGeometry(wx, wz, geometry.rooms)
      onRoomSelect?.(room?.room ?? null)
    }

    canvas.addEventListener("mousemove", handleMove)
    canvas.addEventListener("mouseleave", handleLeave)
    canvas.addEventListener("click", handleClick)

    return () => {
      canvas.removeEventListener("mousemove", handleMove)
      canvas.removeEventListener("mouseleave", handleLeave)
      canvas.removeEventListener("click", handleClick)
    }
  }, [geometry, onRoomSelect])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.style.cursor = hoveredRoomId ? "pointer" : "default"
  }, [hoveredRoomId])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{floor.title}</h3>

      <div className="overflow-hidden rounded-lg border bg-card">
        {geometry && geometry.rooms.length ? (
          <div
            ref={containerRef}
            className="relative w-full"
            style={{ minHeight: "320px", height: "min(500px, 60vh)" }}
          >
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            표시할 수 있는 방 정보가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}

interface FloorplanVisualizerProps {
  floor: Floor
  selectedRoomId?: string | null
  onRoomSelect?: (room: FloorplanRoom | null) => void
}

function buildFloorGeometry(
  floor: Floor,
): { world: WorldBounds; rooms: RoomGeometry[] } | null {
  const allPoints: { x: number; z: number }[] = []
  const cornerPositions = new Map<string, { x: number; z: number }>()

  const recordPoint = (point: { x: number; z: number } | null | undefined) => {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) return null
    allPoints.push(point)
    return point
  }

  for (const corner of floor.corners ?? []) {
    const position = corner?.position
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.z)) continue
    const pos = { x: position.x, z: position.z }
    cornerPositions.set(corner.archiId, pos)
    recordPoint(pos)
  }

  const rooms: RoomGeometry[] = []

  for (const room of floor.rooms ?? []) {
    const rawPoints: ({ x: number; z: number } | null)[] = []

    for (const corner of room.corners ?? []) {
      if (typeof corner === "string") {
        rawPoints.push(cornerPositions.get(corner) ?? null)
        continue
      }

      const pos = corner?.position
      if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.z)) {
        const normalized = { x: pos.x, z: pos.z }
        if (corner.archiId) {
          cornerPositions.set(corner.archiId, normalized)
        }
        rawPoints.push(normalized)
      } else {
        rawPoints.push(null)
      }
    }

    const cleaned: { x: number; z: number }[] = []
    for (const point of rawPoints) {
      if (!point) continue
      const last = cleaned[cleaned.length - 1]
      if (!samePoint(last, point)) {
        cleaned.push(point)
      }
    }

    if (cleaned.length > 2 && samePoint(cleaned[0], cleaned[cleaned.length - 1])) {
      cleaned.pop()
    }

    if (cleaned.length < 3) continue

    cleaned.forEach(recordPoint)

    rooms.push({
      room,
      points: cleaned,
      center: centroid(cleaned),
    })
  }

  if (allPoints.length === 0) return null

  const xs = allPoints.map((p) => p.x)
  const zs = allPoints.map((p) => p.z)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minZ = Math.min(...zs)
  const maxZ = Math.max(...zs)

  return {
    world: { minX, maxX, minZ, maxZ },
    rooms,
  }
}

function fitView(width: number, height: number, world: WorldBounds): ViewTransform {
  const spanX = Math.max(1e-9, world.maxX - world.minX)
  const spanZ = Math.max(1e-9, world.maxZ - world.minZ)
  const scale = Math.min(width / spanX, height / spanZ)
  const centerX = world.minX + spanX / 2
  const centerZ = world.minZ + spanZ / 2
  const screenCenterX = (centerX - world.minX) * scale
  const screenCenterZ = (centerZ - world.minZ) * scale
  return {
    scale,
    tx: width / 2 - screenCenterX,
    tz: height / 2 - screenCenterZ,
  }
}

function toScreenX(x: number, view: ViewTransform, world: WorldBounds): number {
  return (x - world.minX) * view.scale + view.tx
}

function toScreenY(z: number, view: ViewTransform, world: WorldBounds): number {
  return (z - world.minZ) * view.scale + view.tz
}

function toWorldX(screenX: number, view: ViewTransform, world: WorldBounds): number {
  return (screenX - view.tx) / view.scale + world.minX
}

function toWorldZ(screenY: number, view: ViewTransform, world: WorldBounds): number {
  return (screenY - view.tz) / view.scale + world.minZ
}

function pickRoomGeometry(wx: number, wz: number, rooms: RoomGeometry[]): RoomGeometry | null {
  for (let i = rooms.length - 1; i >= 0; i--) {
    if (pointInPolygon(wx, wz, rooms[i].points)) {
      return rooms[i]
    }
  }
  return null
}

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  rooms: RoomGeometry[],
  world: WorldBounds,
  view: ViewTransform,
  hoveredRoomId: string | null,
  selectedRoomId: string | null,
) {
  const dpr = window.devicePixelRatio || 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  for (const geometry of rooms) {
    if (geometry.room.archiId === hoveredRoomId || geometry.room.archiId === selectedRoomId) continue
    drawRoom(ctx, geometry, view, world, false, false)
  }

  if (selectedRoomId) {
    const selected = rooms.find((room) => room.room.archiId === selectedRoomId)
    if (selected) {
      const isHovered = selected.room.archiId === hoveredRoomId
      drawRoom(ctx, selected, view, world, isHovered, true)
    }
  }

  if (hoveredRoomId) {
    if (hoveredRoomId !== selectedRoomId) {
      const hovered = rooms.find((room) => room.room.archiId === hoveredRoomId)
      if (hovered) {
        drawRoom(ctx, hovered, view, world, true, false)
      }
    }
  }

  for (const geometry of rooms) {
    drawLabel(ctx, geometry, view, world)
  }
}

function drawRoom(
  ctx: CanvasRenderingContext2D,
  geometry: RoomGeometry,
  view: ViewTransform,
  world: WorldBounds,
  hovered: boolean,
  selected: boolean,
) {
  if (geometry.points.length < 3) return

  ctx.beginPath()
  geometry.points.forEach((point, index) => {
    const sx = toScreenX(point.x, view, world)
    const sy = toScreenY(point.z, view, world)
    if (index === 0) {
      ctx.moveTo(sx, sy)
    } else {
      ctx.lineTo(sx, sy)
    }
  })
  ctx.closePath()

  ctx.fillStyle = hovered || selected ? ROOM_FILL_COLOR_HOVER : ROOM_FILL_COLOR
  ctx.fill()

  if (selected) {
    ctx.lineWidth = ROOM_STROKE_WIDTH_SELECTED
  } else if (hovered) {
    ctx.lineWidth = ROOM_STROKE_WIDTH_HOVER
  } else {
    ctx.lineWidth = ROOM_STROKE_WIDTH
  }
  ctx.strokeStyle = ROOM_STROKE_COLOR
  ctx.stroke()
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  geometry: RoomGeometry,
  view: ViewTransform,
  world: WorldBounds,
) {
  const label = getRoomLabel(geometry.room)
  if (!label) return

  const sx = toScreenX(geometry.center.x, view, world)
  const sy = toScreenY(geometry.center.z, view, world)

  ctx.fillStyle = "rgba(15, 23, 42, 0.95)"
  ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, 'Segoe UI'"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(label, sx, sy)
}

function getRoomLabel(room: FloorplanRoom): string | null {
  if (!room.type) return null
  const parsed = Number.parseInt(room.type, 10)
  if (!Number.isFinite(parsed)) return null
  return ROOM_TYPE_LABELS[parsed] ?? null
}
