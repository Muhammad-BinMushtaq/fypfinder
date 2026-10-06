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
    { label: "Clarity", value: scores.complexity },
    { label: "Impact", value: scores.marketRelevance },
    { label: "Potential", value: scores.timelineRealism },
  ]

  const size = 280
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
    <div className="relative mx-auto flex max-w-sm items-center justify-center py-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background web grids */}
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
              strokeOpacity={0.08}
              className="text-gray-900 dark:text-white"
            />
          )
        })}

        {/* Radial axes */}
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
              strokeOpacity={0.08}
              className="text-gray-900 dark:text-white"
            />
          )
        })}

        {/* Monochrome / High-contrast Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="currentColor"
          fillOpacity={0.12}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="text-gray-900 dark:text-white transition-all duration-700 ease-out"
        />

        {/* Data vertex dots */}
        {data.map((d, i) => {
          const pt = getPoint(mounted ? d.value : 0, i, data.length)
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill="currentColor"
              className="text-gray-900 dark:text-white transition-all duration-700 ease-out"
            />
          )
        })}

        {/* Dimension Labels */}
        {data.map((d, i) => {
          const pt = getPoint(125, i, data.length, 100)
          return (
            <text
              key={i}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="fill-current text-[11px] font-medium text-gray-500 dark:text-gray-400"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
