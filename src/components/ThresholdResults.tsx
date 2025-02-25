import { ThresholdLevels } from '@/lib/types';
import { useState } from 'react';

interface ThresholdResultsProps {
  thresholds: ThresholdLevels[] | null;
}

export default function ThresholdResults({ thresholds }: ThresholdResultsProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  if (!thresholds || thresholds.length === 0) {
    return null;
  }

  const toggleExpand = (productId: string) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Inventory Thresholds</h3>
      
      <div className="space-y-4">
        {thresholds.map(threshold => (
          <div 
            key={threshold.product_id} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div 
              className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(threshold.product_id)}
            >
              <div>
                <h4 className="font-medium text-gray-900">{threshold.product_name}</h4>
                <p className="text-sm text-gray-500">ID: {threshold.product_id}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-sm text-gray-500">Threshold Levels</span>
                  <p className="font-medium">
                    <span className="text-red-600">{threshold.low}</span> / 
                    <span className="text-amber-600 mx-1">{threshold.medium}</span> / 
                    <span className="text-green-600">{threshold.high}</span>
                  </p>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-400 transition-transform ${expandedProduct === threshold.product_id ? 'transform rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {expandedProduct === threshold.product_id && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <h4 className="font-medium text-red-700">Low Threshold</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-2">{threshold.low}</p>
                    <p className="text-sm text-red-600 mt-1">Reorder immediately</p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <h4 className="font-medium text-amber-700">Medium Threshold</h4>
                    </div>
                    <p className="text-2xl font-bold text-amber-600 mt-2">{threshold.medium}</p>
                    <p className="text-sm text-amber-600 mt-1">Plan to reorder soon</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <h4 className="font-medium text-green-700">High Threshold</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-2">{threshold.high}</p>
                    <p className="text-sm text-green-600 mt-1">Optimal stock level</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-700">Lead Time Used</h4>
                    <p className="text-xl font-bold text-blue-600 mt-1">{threshold.lead_time_used} days</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-medium text-purple-700">Avg. Daily Sales</h4>
                    <p className="text-xl font-bold text-purple-600 mt-1">{threshold.avg_daily_sales} units</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}