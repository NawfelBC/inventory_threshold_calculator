import { useState } from 'react';
import { ThresholdParams, ProductSummary } from '@/lib/types';

interface ThresholdFormProps {
  onSubmit: (params: ThresholdParams, selectedProductId?: string) => void;
  isDataLoaded: boolean;
  productSummaries: ProductSummary[];
}

export default function ThresholdForm({ onSubmit, isDataLoaded, productSummaries }: ThresholdFormProps) {
  const [params, setParams] = useState<ThresholdParams>({
    safetyStockPercentage: 20,
    averageDailySales: null,
    useProductLeadTime: true,
    customLeadTime: 7
  });

  const [useCalculatedAvg, setUseCalculatedAvg] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  const [formErrors, setFormErrors] = useState<{
    safetyStockPercentage?: string;
    customLeadTime?: string;
    averageDailySales?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert any string values to numbers before submitting
      const submittedParams = {
        ...params,
        customLeadTime: typeof params.customLeadTime === 'string' ? 
          Number(params.customLeadTime) : params.customLeadTime
      };
      onSubmit(submittedParams as ThresholdParams, selectedProductId);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setParams(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setParams(prev => ({
        ...prev,
        [name]: name === 'averageDailySales' ? (value ? Number(value) : null) : 
                value === '' ? '' : Number(value)
      }));
    }
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value === 'all' ? undefined : e.target.value);
  };

  const toggleUseCalculatedAvg = () => {
    setUseCalculatedAvg(prevState => {
      setParams(prevParams => ({
        ...prevParams,
        averageDailySales: !prevState ? null : 1
      }));
      return !prevState;
    });
  };

  const validateForm = (): boolean => {
    const errors: {
      safetyStockPercentage?: string;
      customLeadTime?: string;
      averageDailySales?: string;
    } = {};
    
    if (params.safetyStockPercentage < 0 || params.safetyStockPercentage > 100) {
      errors.safetyStockPercentage = "Safety stock must be between 0 and 100%";
    }
    
    if (!params.useProductLeadTime && (params.customLeadTime === '' || Number(params.customLeadTime) <= 0)) {
      errors.customLeadTime = "Lead time must be greater than 0";
    }
    
    if (!useCalculatedAvg && (params.averageDailySales === null || params.averageDailySales < 0)) {
      errors.averageDailySales = "Average daily sales must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      {productSummaries.length > 0 && (
        <div>
          <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700">
            Select Product
          </label>
          <select
            id="productSelect"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
            onChange={handleProductSelect}
            value={selectedProductId || 'all'}
          >
            <option value="all" className="text-gray-900">All Products</option>
            {productSummaries.map(product => (
              <option key={product.product_id} value={product.product_id} className="text-gray-900">
                {product.product_name} ({product.product_id})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label htmlFor="safetyStockPercentage" className="block text-sm font-medium text-gray-700">
          Safety Stock Percentage
        </label>
        <input
          type="number"
          id="safetyStockPercentage"
          name="safetyStockPercentage"
          min="0"
          max="100"
          value={params.safetyStockPercentage}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
          required
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="useProductLeadTime"
          name="useProductLeadTime"
          checked={params.useProductLeadTime}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="useProductLeadTime" className="ml-2 block text-sm text-gray-700">
          Use lead time from data
        </label>
      </div>
      
      {!params.useProductLeadTime && (
        <div>
          <label htmlFor="customLeadTime" className="block text-sm font-medium text-gray-700">
            Custom Lead Time (days)
          </label>
          <input
            type="number"
            id="customLeadTime"
            name="customLeadTime"
            min="1"
            value={params.customLeadTime}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm text-gray-900 ${
              formErrors.customLeadTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required={!params.useProductLeadTime}
          />
          {formErrors.customLeadTime && (
            <p className="mt-1 text-sm text-red-600">{formErrors.customLeadTime}</p>
          )}
        </div>
      )}
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="useCalculatedAvg"
          checked={useCalculatedAvg}
          onChange={toggleUseCalculatedAvg}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="useCalculatedAvg" className="ml-2 block text-sm text-gray-700">
          Calculate average daily sales from data
        </label>
      </div>
      
      {!useCalculatedAvg && (
        <div>
          <label htmlFor="averageDailySales" className="block text-sm font-medium text-gray-700">
            Average Daily Sales
          </label>
          <input
            type="number"
            id="averageDailySales"
            name="averageDailySales"
            min="0"
            step="0.01"
            value={params.averageDailySales || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
            required={!useCalculatedAvg}
          />
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={!isDataLoaded}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isDataLoaded 
              ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
              : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Calculate Thresholds
        </button>
      </div>
    </form>
  );
}