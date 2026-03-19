'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

interface AdvancedFilterProps {
  categories: FilterCategory[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (categoryId: string, values: string[]) => void;
  onClearAll: () => void;
}

export function AdvancedFilter({ 
  categories, 
  selectedFilters, 
  onFilterChange, 
  onClearAll 
}: AdvancedFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFilterToggle = (categoryId: string, value: string) => {
    const currentFilters = selectedFilters[categoryId] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    onFilterChange(categoryId, newFilters);
  };

  const removeFilter = (categoryId: string, value: string) => {
    const currentFilters = selectedFilters[categoryId] || [];
    const newFilters = currentFilters.filter(f => f !== value);
    onFilterChange(categoryId, newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  };

  const getActiveFilters = () => {
    const active: { categoryId: string; label: string; value: string }[] = [];
    Object.entries(selectedFilters).forEach(([categoryId, values]) => {
      const category = categories.find(c => c.id === categoryId);
      values.forEach(value => {
        const option = category?.options.find(o => o.value === value);
        if (option) {
          active.push({ categoryId, label: option.label, value });
        }
      });
    });
    return active;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">{getActiveFilterCount()}</Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
            disabled={getActiveFilterCount() === 0}
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        {getActiveFilters().length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {getActiveFilters().map((filter, index) => (
                <Badge 
                  key={`${filter.categoryId}-${filter.value}-${index}`}
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {filter.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter(filter.categoryId, filter.value)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter Categories */}
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className="text-sm text-gray-500">
                  {selectedFilters[category.id]?.length || 0} selected
                </span>
              </button>
              
              {expandedCategories.includes(category.id) && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {category.options.map((option) => (
                      <label 
                        key={option.value} 
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters[category.id]?.includes(option.value) || false}
                          onChange={() => handleFilterToggle(category.id, option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}