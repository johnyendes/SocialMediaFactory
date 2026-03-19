'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Download, Share, TrendingUp, Building, DollarSign, MapPin, BarChart3, Bookmark, RefreshCw } from 'lucide-react';
import { StatGrid } from '@/components/StatGrid';
import { CompetitorBar } from '@/components/CompetitorBar';
import { TrendLine } from '@/components/TrendLine';
import { DataTable } from '@/components/DataTable';
import { AdvancedFilterSystem } from '@/components/AdvancedFilterSystem';
import { ExportPanel } from '@/components/ExportPanel';
import { useMarketSearch } from '@/hooks/useMarketSearch';

interface SearchResults {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  revenue: string;
  growth: number;
  score: number;
  employees: number;
  founded: number;
}

export default function ResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [selectedCompany, setSelectedCompany] = useState<SearchResults | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Use the custom hook for search functionality
  const { searchState, search, clearResults, refetch, exportData, saveSearch } = useMarketSearch();

  const filterCategories = [
    {
      id: 'industry',
      name: 'Industry',
      options: [
        { id: 'tech', label: 'Technology', value: 'Technology' },
        { id: 'health', label: 'Healthcare', value: 'Healthcare' },
        { id: 'finance', label: 'Finance', value: 'Finance' },
        { id: 'manufacturing', label: 'Manufacturing', value: 'Manufacturing' },
        { id: 'retail', label: 'Retail', value: 'Retail' },
        { id: 'education', label: 'Education', value: 'Education' }
      ]
    },
    {
      id: 'size',
      name: 'Company Size',
      options: [
        { id: 'startup', label: 'Startup (1-10)', value: 'Startup' },
        { id: 'smb', label: 'SMB (11-50)', value: 'SMB' },
        { id: 'mid', label: 'Mid-Market (51-200)', value: 'Mid-Market' },
        { id: 'enterprise', label: 'Enterprise (201+)', value: 'Enterprise' }
      ]
    },
    {
      id: 'location',
      name: 'Location',
      options: [
        { id: 'na', label: 'North America', value: 'North America' },
        { id: 'eu', label: 'Europe', value: 'Europe' },
        { id: 'apac', label: 'Asia Pacific', value: 'Asia Pacific' },
        { id: 'latam', label: 'Latin America', value: 'Latin America' },
        { id: 'me', label: 'Middle East', value: 'Middle East' }
      ]
    },
    {
      id: 'revenue',
      name: 'Revenue Range',
      options: [
        { id: 'r1', label: '< $1M', value: '< $1M' },
        { id: 'r2', label: '$1-10M', value: '$1-10M' },
        { id: 'r3', label: '$10-50M', value: '$10-50M' },
        { id: 'r4', label: '$50-100M', value: '$50-100M' },
        { id: 'r5', label: '> $100M', value: '> $100M' }
      ]
    }
  ];

  const tableColumns = [
    {
      key: 'name',
      label: 'Company Name',
      sortable: true,
      render: (value: string, row: SearchResults) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">Founded {row.founded}</div>
        </div>
      )
    },
    {
      key: 'industry',
      label: 'Industry',
      sortable: true
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true
    },
    {
      key: 'employees',
      label: 'Employees',
      sortable: true,
      render: (value: number) => `${value.toLocaleString()}`
    },
    {
      key: 'growth',
      label: 'Growth',
      sortable: true
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true
    }
  ];

  const handleSearch = async () => {
    await search({
      query: searchTerm,
      industry: selectedFilters.industry || [],
      size: selectedFilters.size || [],
      location: selectedFilters.location || [],
      revenue: selectedFilters.revenue || [],
      page: 1,
      limit: 10
    });
  };

  const handleSaveSearch = async () => {
    if (searchName.trim()) {
      await saveSearch(searchName);
      setSaveDialogOpen(false);
      setSearchName('');
    }
  };

  const handleFilterChange = (categoryId: string, values: string[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [categoryId]: values
    }));
  };

  const handleClearAllFilters = () => {
    setSelectedFilters({});
  };

  const stats = [
    {
      title: 'Total Companies',
      value: '2,847',
      change: '+12.5%',
      icon: Building,
      color: 'text-blue-600'
    },
    {
      title: 'Market Opportunities',
      value: '384',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Avg. Deal Size',
      value: '$2.4M',
      change: '+15.3%',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Active Markets',
      value: '42',
      change: '+5.1%',
      icon: MapPin,
      color: 'text-orange-600'
    }
  ];

  // Load initial data
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Market Research</h1>
            <p className="text-gray-600 mt-2">Discover and analyze market opportunities</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setSaveDialogOpen(true)}
              disabled={searchState.data.length === 0}
            >
              <Bookmark className="h-4 w-4" />
              Save Search
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowExport(!showExport)}
              disabled={searchState.data.length === 0}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatGrid stats={stats} />

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Company Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies, industries, or markets..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={searchState.loading}>
                {searchState.loading ? 'Searching...' : 'Search'}
              </Button>
              <Button 
                variant="outline" 
                onClick={refetch}
                disabled={searchState.loading}
                title="Refresh results"
              >
                <RefreshCw className={`h-4 w-4 ${searchState.loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <AdvancedFilterSystem
          onFiltersChange={(filters) => {
            // Handle filter changes
            console.log('Filters changed:', filters)
          }}
          onSearch={(filters) => {
            // Handle search
            console.log('Search with filters:', filters)
          }}
        />

        {/* Export Panel */}
        {showExport && (
          <ExportPanel 
            data={searchState.data} 
            searchQuery={searchTerm}
            filters={selectedFilters}
          />
        )}

        {/* Results Table */}
        <DataTable
          columns={tableColumns}
          data={searchState.data}
          loading={searchState.loading}
          pageSize={10}
          onRowClick={(row) => setSelectedCompany(row)}
        />

        {/* Analysis Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Industry Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLine 
                data={[
                  { month: 'Jan', Technology: 65, Healthcare: 45, Finance: 78, Manufacturing: 52 },
                  { month: 'Feb', Technology: 72, Healthcare: 52, Finance: 82, Manufacturing: 55 },
                  { month: 'Mar', Technology: 78, Healthcare: 58, Finance: 85, Manufacturing: 58 },
                  { month: 'Apr', Technology: 85, Healthcare: 62, Finance: 88, Manufacturing: 61 },
                  { month: 'May', Technology: 92, Healthcare: 68, Finance: 91, Manufacturing: 64 },
                  { month: 'Jun', Technology: 98, Healthcare: 74, Finance: 94, Manufacturing: 67 }
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Competitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompetitorBar 
                data={[
                  { name: 'TechCorp', marketShare: 35, revenue: 850 },
                  { name: 'InnovateCo', marketShare: 28, revenue: 680 },
                  { name: 'GlobalSys', marketShare: 22, revenue: 520 },
                  { name: 'DataFlow', marketShare: 15, revenue: 380 }
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Company Detail Modal/Sidebar */}
        {selectedCompany && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Details: {selectedCompany.name}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCompany(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Company Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Industry:</span> {selectedCompany.industry}</div>
                    <div><span className="text-gray-600">Size:</span> {selectedCompany.size}</div>
                    <div><span className="text-gray-600">Founded:</span> {selectedCompany.founded}</div>
                    <div><span className="text-gray-600">Employees:</span> {selectedCompany.employees.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Financial Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Revenue:</span> {selectedCompany.revenue}</div>
                    <div><span className="text-gray-600">Growth Rate:</span> <span className="text-green-600 font-medium">+{selectedCompany.growth}%</span></div>
                    <div><span className="text-gray-600">Market Score:</span> {selectedCompany.score}/100</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location & Operations</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Region:</span> {selectedCompany.location}</div>
                    <div><span className="text-gray-600">Market Position:</span> Leader</div>
                    <div><span className="text-gray-600">Competitive Edge:</span> Innovation</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button size="sm">View Full Profile</Button>
                <Button size="sm" variant="outline">Add to Watchlist</Button>
                <Button size="sm" variant="outline">Contact</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Search Dialog */}
        {saveDialogOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Save Search Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  placeholder="Enter a name for this search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Summary:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Query: {searchTerm || 'All companies'}</div>
                  <div>Filters: {Object.values(selectedFilters).flat().length} applied</div>
                  <div>Results: {searchState.total} companies found</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                  Save Search
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSaveDialogOpen(false);
                    setSearchName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}