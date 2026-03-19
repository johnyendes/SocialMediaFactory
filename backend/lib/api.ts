import axios from 'axios';

// API configuration for TechFactoryBuilder integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.techfactorybuilder.com';
const API_VERSION = 'v1';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techfactory_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('techfactory_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Market Intelligence API endpoints
export const marketIntelligenceAPI = {
  // Search companies
  searchCompanies: async (params: {
    query?: string;
    industry?: string[];
    size?: string[];
    location?: string[];
    revenue?: string[];
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/market-intelligence/companies', { params });
    return response.data;
  },

  // Get company details
  getCompanyDetails: async (companyId: string) => {
    const response = await apiClient.get(`/market-intelligence/companies/${companyId}`);
    return response.data;
  },

  // Get market trends
  getMarketTrends: async (params: {
    industry?: string;
    timeframe?: string;
    metrics?: string[];
  }) => {
    const response = await apiClient.get('/market-intelligence/trends', { params });
    return response.data;
  },

  // Get competitor analysis
  getCompetitorAnalysis: async (params: {
    companies: string[];
    metrics: string[];
  }) => {
    const response = await apiClient.post('/market-intelligence/competitors', params);
    return response.data;
  },

  // Export data
  exportData: async (params: {
    format: 'pdf' | 'csv' | 'excel';
    searchQuery?: string;
    filters?: Record<string, any>;
    includeCharts?: boolean;
  }) => {
    const response = await apiClient.post('/market-intelligence/export', params, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Share report
  shareReport: async (params: {
    reportId: string;
    recipients: string[];
    message?: string;
  }) => {
    const response = await apiClient.post('/market-intelligence/share', params);
    return response.data;
  },

  // Get saved searches
  getSavedSearches: async () => {
    const response = await apiClient.get('/market-intelligence/saved-searches');
    return response.data;
  },

  // Save search
  saveSearch: async (params: {
    name: string;
    query: string;
    filters: Record<string, any>;
  }) => {
    const response = await apiClient.post('/market-intelligence/saved-searches', params);
    return response.data;
  },

  // Get watchlist
  getWatchlist: async () => {
    const response = await apiClient.get('/market-intelligence/watchlist');
    return response.data;
  },

  // Add to watchlist
  addToWatchlist: async (companyId: string) => {
    const response = await apiClient.post(`/market-intelligence/watchlist/${companyId}`);
    return response.data;
  },

  // Remove from watchlist
  removeFromWatchlist: async (companyId: string) => {
    const response = await apiClient.delete(`/market-intelligence/watchlist/${companyId}`);
    return response.data;
  }
};

// Mock data service for development/testing
export const mockDataService = {
  generateCompanyData: (count: number = 50) => {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education'];
    const sizes = ['Startup', 'SMB', 'Mid-Market', 'Enterprise'];
    const locations = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
    const revenueRanges = ['< $1M', '$1-10M', '$10-50M', '$50-100M', '> $100M'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `company-${i + 1}`,
      name: `Company ${String.fromCharCode(65 + (i % 26))}${Math.floor(Math.random() * 1000)}`,
      industry: industries[Math.floor(Math.random() * industries.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      revenue: revenueRanges[Math.floor(Math.random() * revenueRanges.length)],
      growth: Math.round((Math.random() * 60 - 10) * 10) / 10,
      score: Math.floor(Math.random() * 40) + 60,
      employees: Math.floor(Math.random() * 1000) + 10,
      founded: Math.floor(Math.random() * 30) + 1990
    }));
  },

  generateTrendData: () => [
    { month: 'Jan', Technology: 65, Healthcare: 45, Finance: 78, Manufacturing: 52 },
    { month: 'Feb', Technology: 72, Healthcare: 52, Finance: 82, Manufacturing: 55 },
    { month: 'Mar', Technology: 78, Healthcare: 58, Finance: 85, Manufacturing: 58 },
    { month: 'Apr', Technology: 85, Healthcare: 62, Finance: 88, Manufacturing: 61 },
    { month: 'May', Technology: 92, Healthcare: 68, Finance: 91, Manufacturing: 64 },
    { month: 'Jun', Technology: 98, Healthcare: 74, Finance: 94, Manufacturing: 67 }
  ],

  generateCompetitorData: () => [
    { name: 'TechCorp', marketShare: 35, revenue: 850, growth: 24.5 },
    { name: 'InnovateCo', marketShare: 28, revenue: 680, growth: 32.1 },
    { name: 'GlobalSys', marketShare: 22, revenue: 520, growth: 18.3 },
    { name: 'DataFlow', marketShare: 15, revenue: 380, growth: 45.2 }
  ]
};

export default apiClient;