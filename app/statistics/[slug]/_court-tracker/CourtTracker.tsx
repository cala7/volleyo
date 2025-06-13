"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useStatistics } from "../StatisticsProvider"
import { Statistics } from "../columns"
import { SplitCounterButton } from "./SplitCounterButton"

type StatKey = keyof Statistics

type Stat = {
  key: StatKey
  name: string
}

const DEFAULT_STATS: Stat[] = [
  { key: "kills", name: "Attack" },
  { key: "blockMultiple", name: "Block" },
  { key: "digs", name: "Dig" },
  { key: "setAssists", name: "Set" },
  { key: "serveAces", name: "Ace" },
]

export default function CourtTracker() {
  const { statistics, setStatistics, setHasUnsavedChanges } = useStatistics<Statistics>()
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [selectedBench, setSelectedBench] = useState<string>("")
  const [courtPositions, setCourtPositions] = useState<(Statistics | undefined)[]>(
    new Array(6).fill(undefined),
  )
  const [benched, setBenched] = useState<Statistics[]>(statistics)

  const selectedPositionIx = Number(selectedPosition.split("-")[1])
  const selectedCourtPlayer = courtPositions[selectedPositionIx]
  const statsOfSelectedPlayer = statistics.find(stat => stat.id === selectedCourtPlayer?.id)

  const handleIncrementStat = (statKey: StatKey) => {
    setStatistics(prev => {
      const newStatistics = [...prev]
      const index = newStatistics.findIndex(stat => stat.id === selectedCourtPlayer?.id)
      if (index !== -1) {
        const previousStat = prev[index][statKey] as number
        newStatistics[index] = {
          ...newStatistics[index],
          [statKey]: previousStat + 1,
        }
      }

      return newStatistics
    })
    setHasUnsavedChanges(true)
  }

  const handleDecrementStat = (statKey: StatKey) => {
    setStatistics(prev => {
      const newStatistics = [...prev]
      const index = newStatistics.findIndex(stat => stat.id === selectedCourtPlayer?.id)
      if (index !== -1) {
        const previousStat = prev[index][statKey] as number
        newStatistics[index] = {
          ...newStatistics[index],
          [statKey]: Math.max(previousStat - 1, 0),
        }
      }

      return newStatistics
    })

    setHasUnsavedChanges(true)
  }

  const handleSubstitute = () => {
    const selectedBenchPlayer = statistics.find(stat => stat.id === selectedBench)
    if (!selectedBenchPlayer) return

    setCourtPositions(prev => {
      const newCourtPosition = [...prev]
      newCourtPosition[selectedPositionIx] = selectedBenchPlayer
      return newCourtPosition
    })

    setSelectedBench("")
    setBenched(prev => {
      const newBenched = [...prev]
      const index = newBenched.findIndex(stat => stat.id === selectedBenchPlayer.id)
      if (index !== -1) {
        newBenched.splice(index, 1)
      }
      if (selectedCourtPlayer) {
        newBenched.push(selectedCourtPlayer)
      }
      return newBenched
    })
  }

  return (
    <>
      <div className="flex flex-row gap-4 my-4">
        <Card className=" w-full p-12 border rounded-md">
          <ToggleGroup
            className="grid grid-cols-3 gap-12"
            type="single"
            value={selectedPosition}
            onValueChange={val => setSelectedPosition(val ?? "")}
          >
            {courtPositions.map((stat, index) => {
              return (
                <Label
                  key={`position-${index}`}
                  className="cursor-pointer"
                >
                  <ToggleGroupItem
                    value={`position-${index}`}
                    className="sr-only"
                    id={`player-${`position-${index}`}`}
                  />
                  <Card
                    className={cn(
                      "transition-all aspect-[4/3] relative overflow-hidden flex items-center justify-center",
                      selectedPosition === `position-${index}`
                        ? "border-green-600 ring-2 ring-green-600"
                        : "hover:border-muted hover:bg-muted",
                    )}
                  >
                    <div className="absolute font-bold text-muted-foreground/10 text-responsive-number pointer-events-none select-none z-0">
                      {index + 1}
                    </div>
                    <CardContent className="p-4">
                      <span className="font-medium">{stat?.name}</span>
                    </CardContent>
                  </Card>
                </Label>
              )
            })}
          </ToggleGroup>
        </Card>

        <Card className="flex flex-col gap-6 p-4">
          {DEFAULT_STATS.map(stat => {
            const currentStatValue = (statsOfSelectedPlayer?.[stat.key] ?? 0) as number

            return (
              <SplitCounterButton
                key={stat.key}
                value={currentStatValue}
                onIncrement={() => handleIncrementStat(stat.key)}
                disabledIncrement={!selectedCourtPlayer}
                onDecrement={() => handleDecrementStat(stat.key)}
                disabledDecrement={!selectedCourtPlayer || currentStatValue <= 0}
                label={stat.name}
              />
            )
          })}
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="font-medium">Bench Players</CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            className="flex flex-wrap gap-6 justify-start"
            type="single"
            onValueChange={val => setSelectedBench(val ?? "")}
          >
            {benched.length === 0 && <div>No players available</div>}
            {benched.map(stat => {
              return (
                <Label
                  key={stat.id}
                  className="cursor-pointer"
                >
                  <ToggleGroupItem
                    value={stat.id}
                    className="sr-only"
                    id={`player-${`bench-${stat.id}`}`}
                  />
                  <Card
                    className={cn(
                      "transition-all aspect-[4/3] flex items-center justify-center",
                      selectedBench === stat.id
                        ? "border-slate-600 ring-2 ring-slate-600"
                        : "hover:border-muted hover:bg-muted",
                    )}
                  >
                    <CardContent className="p-4">
                      <span className="font-semibold">{stat.name}</span>
                    </CardContent>
                  </Card>
                </Label>
              )
            })}
          </ToggleGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubstitute}>Substitute</Button>
        </CardFooter>
      </Card>
    </>
  )
}
