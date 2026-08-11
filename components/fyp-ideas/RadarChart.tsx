"use client"

import { useEffect, useState } from "react"

interface RadarChartProps {
  scores: {
    feasibility: number
    originality: number
    complexity: number
    marketRelevance: number
    timelineRealism: number
  }
}

export function RadarChart({ scores }: RadarChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    { label: "Feasibility", value: scores.feasibility },
    { label: "Originality", value: scores.originality },
    { label: "Complexity", value: scores.complexity },
    { label: "Market", value: scores.marketRelevance },
    { label: "Timeline", value: scores.timelineRealism },
  ]

  const size = 300
  const center = size / 2
  const radius = (size / 2) * 0.65

  const getPoint = (value: number, index: number, total: number, max = 100) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    const distance = (value / max) * radius
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    }
  }

  const polygonPoints = data
    .map((d, i) => {
      const pt = getPoint(mounted ? d.value : 0, i, data.length)
      return `${pt.x},${pt.y}`
    })
    .join(" ")

  return (
    <div className="relative mx-auto flex max-w-sm items-center justify-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background grids */}
        {[20, 40, 60, 80, 100].map((circleValue) => {
          const r = (circleValue / 100) * radius
          return (
            <polygon
              key={circleValue}
              points={data
                .map((_, i) => {
                  const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
                  return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
                })
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              className="text-gray-900 dark:text-white"
            />
          )
        })}

        {/* Axes */}
        {data.map((_, i) => {
          const pt = getPoint(100, i, data.length)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="currentColor"
              strokeOpacity={0.1}
              className="text-gray-900 dark:text-white"
            />
          )
        })}

        {/* Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="currentColor"
          fillOpacity={0.2}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className="text-amber-500 transition-all duration-1000 ease-out"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const pt = getPoint(mounted ? d.value : 0, i, data.length)
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill="currentColor"
              className="text-amber-500 transition-all duration-1000 ease-out"
            />
          )
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const pt = getPoint(125, i, data.length, 100)
          return (
            <text
              key={i}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="fill-current text-xs font-medium text-gray-600 dark:text-gray-300"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
