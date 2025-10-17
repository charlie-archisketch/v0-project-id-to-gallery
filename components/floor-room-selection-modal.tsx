"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

  const currentFloor = floors.find((f) => f.id === selectedFloorId) || floors[0]

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
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
            {floors.length === 1 ? (
              <div className="p-4">
                <FloorplanVisualizer
                  floor={floors[0]}
                  onRoomClick={(room) => handleRoomSelect(room, floors[0].title)}
                  onFloorClick={() => handleFloorSelect(floors[0])}
                />
              </div>
            ) : (
              <Tabs value={selectedFloorId || floors[0]?.id} onValueChange={setSelectedFloorId} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {floors.map((floor) => (
                    <TabsTrigger key={floor.id} value={floor.id}>
                      {floor.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {floors.map((floor) => (
                  <TabsContent key={floor.id} value={floor.id} className="p-4">
                    <FloorplanVisualizer
                      floor={floor}
                      onRoomClick={(room) => handleRoomSelect(room, floor.title)}
                      onFloorClick={() => handleFloorSelect(floor)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
