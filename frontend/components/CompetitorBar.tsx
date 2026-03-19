'use client'

import React from 'react'
import { CompetitorBarChart } from './competitor-bar-chart'

interface CompetitorData {
  [key: string]: any
}

interface CompetitorBarProps {
  data: CompetitorData[]
  title?: string
  description?: string
  color?: string
  height?: number
}

export function CompetitorBar({ 
  data, 
  title, 
  description, 
  color = '#10B981',
  height = 300 
}: CompetitorBarProps) {
  return (
    <CompetitorBarChart
      data={data}
      title={title}
      description={description}
      color={color}
      height={height}
    />
  )
}