'use client'

import React from 'react'
import { TrendLineChart } from './trend-line-chart'

interface TrendData {
  [key: string]: any
}

interface TrendLineProps {
  data: TrendData[]
  title?: string
  description?: string
  color?: string
  height?: number
}

export function TrendLine({ 
  data, 
  title, 
  description, 
  color = '#3B82F6',
  height = 300 
}: TrendLineProps) {
  return (
    <TrendLineChart
      data={data}
      title={title}
      description={description}
      color={color}
      height={height}
    />
  )
}