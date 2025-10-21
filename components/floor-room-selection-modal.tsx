"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FloorplanVisualizer } from "@/components/floorplan-visualizer"
import type { Floor, FloorplanRoom } from "@/types/floorplan"

interface FloorRoomSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  floors: Floor[]
  onSelect: (selection: { type: "floor" | "room"; id: string; title: string }) => void
  isLoading?: boolean
}

export function FloorRoomSelectionModal({
  isOpen,
  onClose,
  floors,
  onSelect,
  isLoading,
}: FloorRoomSelectionModalProps) {
  const [selectedFloorId, setSelectedFloorId] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<{ floorId: string; room: FloorplanRoom } | null>(null)

  const currentFloor = floors.find((f) => f.id === (selectedFloorId || floors[0]?.id)) || floors[0]

  useEffect(() => {
    if (!isOpen) {
      setSelectedRoom(null)
      setSelectedFloorId("")
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedRoom && !floors.some((floor) => floor.id === selectedRoom.floorId)) {
      setSelectedRoom(null)
    }
  }, [floors, selectedRoom])

  const handleTabChange = (value: string) => {
    setSelectedFloorId(value)
    setSelectedRoom(null)
  }

  const handleFloorSelect = (floor: Floor) => {
    onSelect({
      type: "floor",
      id: floor.id,
      title: floor.title,
    })
    onClose()
  }

  const handleRoomSelect = (room: FloorplanRoom, floorTitle: string) => {
    onSelect({
      type: "room",
      id: room.archiId,
      title: `${floorTitle} - ${room.title}`,
    })
    onClose()
  }

  const handleConfirmSelection = () => {
    if (floors.length === 0) return
    const fallbackFloor = currentFloor ?? floors[0]
    if (!fallbackFloor) return

    if (selectedRoom) {
      const owningFloor = floors.find((floor) => floor.id === selectedRoom.floorId) ?? fallbackFloor
      handleRoomSelect(selectedRoom.room, owningFloor.title)
    } else {
      handleFloorSelect(fallbackFloor)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>층 또는 방 선택</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="text-sm text-muted-foreground">평면도 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : floors.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">평면도 정보가 없습니다</div>
        ) : (
          <div className="flex flex-col" style={{ height: "calc(90vh - 12rem)" }}>
            {floors.length === 1 ? (
              <div className="flex-1 overflow-y-auto p-4">
                <FloorplanVisualizer
                  floor={floors[0]}
                  selectedRoomId={selectedRoom?.floorId === floors[0].id ? selectedRoom.room.archiId : null}
                  onRoomSelect={(room) => setSelectedRoom(room ? { floorId: floors[0].id, room } : null)}
                />
              </div>
            ) : (
              <Tabs
                value={selectedFloorId || floors[0]?.id}
                onValueChange={handleTabChange}
                className="flex flex-1 flex-col"
              >
                <TabsList className="w-full flex-shrink-0 justify-start overflow-x-auto">
                  {floors.map((floor) => (
                    <TabsTrigger key={floor.id} value={floor.id}>
                      {floor.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {floors.map((floor) => (
                  <TabsContent key={floor.id} value={floor.id} className="flex-1 overflow-y-auto p-4">
                    <FloorplanVisualizer
                      floor={floor}
                      selectedRoomId={selectedRoom?.floorId === floor.id ? selectedRoom.room.archiId : null}
                      onRoomSelect={(room) => setSelectedRoom(room ? { floorId: floor.id, room } : null)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        )}

        {!isLoading && floors.length > 0 && (
          <div className="flex flex-shrink-0 justify-end border-t border-border pt-4">
            <Button onClick={handleConfirmSelection}>선택</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
