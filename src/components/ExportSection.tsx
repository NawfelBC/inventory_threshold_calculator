import { ThresholdLevels } from '@/lib/types';

interface ExportSectionProps {
  thresholds: ThresholdLevels[] | null;
}

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function ExportSection({ thresholds }: ExportSectionProps) {
  if (!thresholds || thresholds.length === 0) {
    return null;
  }

  const exportData = {
    thresholds,
    generatedAt: new Date().toISOString(),
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(exportData, null, 2);
    downloadFile(
      jsonString, 
      `inventory-thresholds-${new Date().toISOString().split('T')[0]}.json`, 
      'application/json'
    );
  };

  const handleExportCSV = () => {
    let csvContent = "product_id,product_name,low_threshold,medium_threshold,high_threshold,lead_time_used,avg_daily_sales\n";
    
    thresholds.forEach(threshold => {
      csvContent += `"${threshold.product_id}","${threshold.product_name}",${threshold.low},${threshold.medium},${threshold.high},${threshold.lead_time_used},${threshold.avg_daily_sales}\n`;
    });
    
    downloadFile(
      csvContent, 
      `inventory-thresholds-${new Date().toISOString().split('T')[0]}.csv`, 
      'text/csv;charset=utf-8;'
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Export Thresholds</h3>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
        <pre className="text-sm text-gray-700">
          {JSON.stringify(exportData, null, 2)}
        </pre>
      </div>
    </div>
  );
}