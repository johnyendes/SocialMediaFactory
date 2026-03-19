'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ComponentType<any>
  color?: string
  trend?: number
  description?: string
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  change,
  icon, 
  color = '#3B82F6',
  trend, 
  description,
  className 
}: StatCardProps) {
  const TrendIcon = change && change.startsWith('+') ? TrendingUp : change && change.startsWith('-') ? TrendingDown : Minus
  const changeColor = change && change.startsWith('+') ? 'text-green-600' : change && change.startsWith('-') ? 'text-red-600' : 'text-gray-600'

  return (
    <Card className={cn('tech-card animate-slide-in', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                {React.createElement(icon, { className: "w-5 h-5" })}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {change && (
            <div className="flex items-center space-x-1">
              <TrendIcon className={cn('h-4 w-4', changeColor)} />
              <span className={cn('text-sm font-medium', changeColor)}>
                {change}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatGridProps {
  children: React.ReactNode
  className?: string
}

export function StatGrid({ children, className }: StatGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {children}
    </div>
  )
}