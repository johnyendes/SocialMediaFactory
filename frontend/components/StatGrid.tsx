'use client'

import React from 'react'
import { StatCard } from './stat-card'

interface StatData {
  title: string
  value: string | number
  change?: string
  icon?: React.ComponentType<any>
  color?: string
  trend?: number
  description?: string
}

interface StatGridProps {
  stats: StatData[]
  className?: string
}

export function StatGrid({ stats, className }: StatGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ''}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          description={stat.description}
        />
      ))}
    </div>
  )
}