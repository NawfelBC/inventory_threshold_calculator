'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ThresholdForm from '@/components/ThresholdForm';
import InventoryChart from '@/components/InventoryChart';
import ThresholdResults from '@/components/ThresholdResults';
import ExportSection from '@/components/ExportSection';
import { parseCSV, getProductSummaries } from '@/lib/csvParser';
import { calculateThresholds } from '@/lib/thresholdCalculator';
import { InventoryRecord, ThresholdParams, ThresholdLevels, ProductSummary } from '@/lib/types';

export default function Home() {
  const [inventoryData, setInventoryData] = useState<InventoryRecord[]>([]);
  const [productSummaries, setProductSummaries] = useState<ProductSummary[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdLevels[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showProductSummaryModal, setShowProductSummaryModal] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parseCSV(file);
      setInventoryData(data);
      
      const summaries = getProductSummaries(data);
      setProductSummaries(summaries);
      
      setThresholds(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setInventoryData([]);
      setProductSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateThresholds = (params: ThresholdParams, selectedProductId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const calculatedThresholds = calculateThresholds(inventoryData, params, selectedProductId);
      setThresholds(calculatedThresholds);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to calculate thresholds");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Threshold Optimizer</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your inventory data and calculate optimal threshold levels
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Use This Tool
            </button>
            
            {productSummaries.length > 0 && (
              <button
                onClick={() => setShowProductSummaryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Product Summary
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Data</h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {isLoading && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Processing file...
                </div>
              )}
              {inventoryData.length > 0 && !isLoading && (
                <div className="mt-4 text-center text-sm text-green-600">
                  Successfully loaded {inventoryData.length} records for {productSummaries.length} products
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configure Thresholds</h2>
              <ThresholdForm 
                onSubmit={handleCalculateThresholds} 
                isDataLoaded={inventoryData.length > 0}
                productSummaries={productSummaries}
              />
            </div>
            
            <div>
              <ExportSection thresholds={thresholds} />
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <InventoryChart data={inventoryData} thresholds={thresholds} />
            <ThresholdResults thresholds={thresholds} />
          </div>
        </div>
        
        {showHelpModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">How to Use This Tool</h2>
                  <button 
                    onClick={() => setShowHelpModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="prose max-w-none text-gray-800">
                  <ol className="space-y-4">
                    <li className="text-gray-800">
                      <strong className="text-gray-900">Upload your inventory data CSV</strong> with the following columns:
                      <ul className="mt-2">
                        <li className="text-gray-800"><code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">product_id</code> - Unique identifier for the product</li>
                        <li className="text-gray-800"><code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">product_name</code> - Name of the product</li>
                        <li className="text-gray-800"><code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">date</code> - Date of the inventory record (YYYY-MM-DD)</li>
                        <li className="text-gray-800"><code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">inventory_level</code> - Current inventory level</li>
                        <li className="text-gray-800"><code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">orders</code> - Number of orders for that day</li>
                        <li className="text-gray-800"><code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">lead_time_days</code> - Lead time for restocking in days</li>
                      </ul>
                    </li>
                    <li className="text-gray-800">
                      <strong className="text-gray-900">Configure threshold parameters</strong> to match your business needs:
                      <ul className="mt-2">
                        <li className="text-gray-800">Safety stock percentage (buffer above lead time demand)</li>
                        <li className="text-gray-800">Choose whether to use lead time from data or a custom value</li>
                        <li className="text-gray-800">Optionally specify a custom average daily sales value</li>
                      </ul>
                    </li>
                    <li className="text-gray-800">
                      <strong className="text-gray-900">Calculate thresholds</strong> to get recommended inventory levels:
                      <ul className="mt-2">
                        <li className="text-gray-800"><span className="text-red-600 font-medium">Low</span>: Reorder immediately</li>
                        <li className="text-gray-800"><span className="text-amber-600 font-medium">Medium</span>: Plan to reorder soon</li>
                        <li className="text-gray-800"><span className="text-green-600 font-medium">High</span>: Optimal stock level</li>
                      </ul>
                    </li>
                    <li className="text-gray-800">
                      <strong className="text-gray-900">Export the results</strong> in JSON or CSV format for use in your inventory management system
                    </li>
                  </ol>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showProductSummaryModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Product Summary</h2>
                  <button 
                    onClick={() => setShowProductSummaryModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Inventory
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Orders
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Lead Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Points
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productSummaries.map((product) => (
                        <tr key={product.product_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.product_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.avg_inventory}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.avg_orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.avg_lead_time} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.data_points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowProductSummaryModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}