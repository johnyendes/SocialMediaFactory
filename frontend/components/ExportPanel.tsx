'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Mail, 
  Link, 
  CheckCircle,
  Loader
} from 'lucide-react';

interface ExportPanelProps {
  data: any[];
  searchQuery?: string;
  filters?: Record<string, any>;
}

export function ExportPanel({ data, searchQuery, filters }: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportedFiles, setExportedFiles] = useState<string[]>([]);

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Professional report with charts and analysis',
      icon: FileText,
      color: 'text-red-600'
    },
    {
      id: 'csv',
      name: 'CSV Data',
      description: 'Raw data for spreadsheet analysis',
      icon: FileSpreadsheet,
      color: 'text-green-600'
    },
    {
      id: 'email',
      name: 'Email Report',
      description: 'Send report directly to stakeholders',
      icon: Mail,
      color: 'text-blue-600'
    },
    {
      id: 'link',
      name: 'Shareable Link',
      description: 'Create a shareable link to this report',
      icon: Link,
      color: 'text-purple-600'
    }
  ];

  const handleExport = async (format: string) => {
    setExporting(format);
    
    // Simulate export process
    setTimeout(() => {
      const fileName = `market-research-${format}-${Date.now()}.${format === 'csv' ? 'csv' : 'pdf'}`;
      setExportedFiles(prev => [...prev, fileName]);
      setExporting(null);
    }, 2000);
  };

  const generateReportSummary = () => {
    return {
      totalRecords: data.length,
      exportDate: new Date().toLocaleDateString(),
      searchQuery: searchQuery || 'All data',
      appliedFilters: Object.keys(filters || {}).length,
      reportId: `RPT-${Date.now().toString(36).toUpperCase()}`
    };
  };

  const summary = generateReportSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Share
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Report Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Records:</span>
              <div className="font-medium text-gray-900">{summary.totalRecords}</div>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <div className="font-medium text-gray-900">{summary.exportDate}</div>
            </div>
            <div>
              <span className="text-gray-600">Query:</span>
              <div className="font-medium text-gray-900 truncate">{summary.searchQuery}</div>
            </div>
            <div>
              <span className="text-gray-600">Report ID:</span>
              <div className="font-medium text-gray-900">{summary.reportId}</div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            const isExporting = exporting === format.id;
            const isExported = exportedFiles.some(f => f.includes(format.id));
            
            return (
              <div key={format.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-6 w-6 ${format.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{format.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                    <div className="mt-3">
                      {isExported ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Exported
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleExport(format.id)}
                          disabled={isExporting}
                          className="flex items-center gap-2"
                        >
                          {isExporting ? (
                            <>
                              <Loader className="h-3 w-3 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3" />
                              Export
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export History */}
        {exportedFiles.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Exports</h4>
            <div className="space-y-2">
              {exportedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{fileName}</span>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Share Options */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Email Recipients</h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email addresses..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="outline">Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}