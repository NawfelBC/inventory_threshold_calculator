import { useState, useMemo } from 'react';
import { InventoryRecord, ThresholdLevels } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';

interface InventoryChartProps {
  data: InventoryRecord[];
  thresholds: ThresholdLevels[] | null;
}

export default function InventoryChart({ data, thresholds }: InventoryChartProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'area' | 'stockflow'>('line');
  
  const productIds = useMemo(() => 
    Array.from(new Set(data.map(record => record.product_id))),
    [data]
  );
  
  const effectiveProductId = selectedProductId || (productIds.length > 0 ? productIds[0] : null);
  
  const filteredData = useMemo(() => 
    effectiveProductId 
      ? data.filter(record => record.product_id === effectiveProductId)
      : data,
    [data, effectiveProductId]
  );
  
  const productThreshold = useMemo(() => 
    thresholds && effectiveProductId
      ? thresholds.find(t => t.product_id === effectiveProductId)
      : null,
    [thresholds, effectiveProductId]
  );
  
  const productName = useMemo(() => 
    effectiveProductId && filteredData.length > 0
      ? filteredData[0].product_name
      : 'All Products',
    [effectiveProductId, filteredData]
  );

  const chartData = useMemo(() => {
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedData.map((record, index, array) => {
      const previousInventory = index > 0 ? array[index-1].inventory_level : record.inventory_level;
      const inventoryChange = record.inventory_level - previousInventory;
      const restockAmount = inventoryChange + record.orders > 0 ? inventoryChange + record.orders : 0;
      
      return {
        date: new Date(record.date).toLocaleDateString(),
        inventory_level: record.inventory_level,
        orders: record.orders,
        product_id: record.product_id,
        product_name: record.product_name,
        inventory_change: inventoryChange,
        restock_amount: restockAmount,
        days_of_supply: productThreshold ? 
          Math.round(record.inventory_level / productThreshold.avg_daily_sales) : 
          null
      };
    });
  }, [filteredData, productThreshold]);

  const inventoryInsights = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const currentLevel = chartData[chartData.length - 1].inventory_level;
    const avgOrders = chartData.reduce((sum, item) => sum + item.orders, 0) / chartData.length;
    
    let status = 'Healthy';
    let statusColor = 'text-green-600';
    
    if (productThreshold) {
      if (currentLevel <= productThreshold.low) {
        status = 'Critical - Reorder Now';
        statusColor = 'text-red-600';
      } else if (currentLevel <= productThreshold.medium) {
        status = 'Warning - Plan to Reorder';
        statusColor = 'text-amber-600';
      }
      
      const daysOfSupply = Math.round(currentLevel / productThreshold.avg_daily_sales);
      
      return {
        currentLevel,
        avgOrders,
        daysOfSupply,
        status,
        statusColor
      };
    }
    
    return {
      currentLevel,
      avgOrders,
      daysOfSupply: null,
      status,
      statusColor
    };
  }, [chartData, productThreshold]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Upload data to visualize inventory levels</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="inventory_level" 
              stroke="#3b82f6" 
              fill="#93c5fd" 
              name="Inventory Level"
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="#9333ea" 
              fill="#d8b4fe" 
              name="Orders"
            />
            
            <ReferenceLine 
              y={productThreshold?.low} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ value: 'Low', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }} 
            />
            <ReferenceLine 
              y={productThreshold?.medium} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ value: 'Medium', position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }} 
            />
            <ReferenceLine 
              y={productThreshold?.high} 
              stroke="#10b981" 
              strokeDasharray="3 3" 
              label={{ value: 'High', position: 'insideTopRight', fill: '#10b981', fontSize: 11 }} 
            />
          </AreaChart>
        );
      
      case 'stockflow':
        return (
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="inventory_level" 
              stroke="#3b82f6" 
              fill="#93c5fd" 
              name="Inventory Level"
            />
            <Bar 
              dataKey="orders" 
              fill="#9333ea" 
              name="Orders"
            />
            <Bar 
              dataKey="restock_amount" 
              fill="#10b981" 
              name="Restocks"
            />
            
            <ReferenceLine 
              y={productThreshold?.low} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ value: 'Low', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }} 
            />
          </ComposedChart>
        );
      
      default:
        return (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="inventory_level" 
              stroke="#3b82f6" 
              activeDot={{ r: 8 }} 
              name="Inventory Level"
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#9333ea" 
              name="Orders"
            />
            
            <ReferenceLine 
              y={productThreshold?.low} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ value: 'Low', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }} 
            />
            <ReferenceLine 
              y={productThreshold?.medium} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ value: 'Medium', position: 'insideTopRight', fill: '#f59e0b', fontSize: 11 }} 
            />
            <ReferenceLine 
              y={productThreshold?.high} 
              stroke="#10b981" 
              strokeDasharray="3 3" 
              label={{ value: 'High', position: 'insideTopRight', fill: '#10b981', fontSize: 11 }} 
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Inventory Levels Over Time</h3>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="chartType" className="text-sm text-gray-600">Chart Type:</label>
            <select
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'line' | 'area' | 'stockflow')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="stockflow">Stock Flow</option>
            </select>
          </div>
          
          {productIds.length > 1 && (
            <select
              value={effectiveProductId || ''}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
            >
              {productIds.map(id => {
                const name = data.find(r => r.product_id === id)?.product_name || id;
                return (
                  <option key={id} value={id} className="text-gray-900">
                    {name} ({id})
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-medium text-gray-700">{productName}</h4>
        
        {inventoryInsights && (
          <div className="flex space-x-4 text-sm">
            <div>
              <span className="text-gray-600">Current Level:</span> 
              <span className="ml-1 font-medium text-gray-900">{inventoryInsights.currentLevel}</span>
            </div>
            
            {inventoryInsights.daysOfSupply !== null && (
              <div>
                <span className="text-gray-600">Days of Supply:</span> 
                <span className="ml-1 font-medium text-gray-900">{inventoryInsights.daysOfSupply} days</span>
              </div>
            )}
            
            <div>
              <span className="text-gray-600">Status:</span> 
              <span className={`ml-1 font-medium ${inventoryInsights.statusColor}`}>
                {inventoryInsights.status}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {chartData.length > 0 && productThreshold && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-md">
            <h5 className="font-medium text-blue-700">Inventory Turnover</h5>
            <p className="text-blue-800">
              {(chartData.reduce((sum, item) => sum + item.orders, 0) / 
                (chartData.reduce((sum, item) => sum + item.inventory_level, 0) / chartData.length)).toFixed(2)}x
            </p>
            <p className="text-xs text-blue-600 mt-1">Higher is better - indicates efficient inventory management</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-md">
            <h5 className="font-medium text-purple-700">Stock-out Risk</h5>
            <p className="text-purple-800">
              {chartData.filter(item => item.inventory_level <= productThreshold.low).length} days below threshold
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {Math.round(chartData.filter(item => item.inventory_level <= productThreshold.low).length / chartData.length * 100)}% of time at risk
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md">
            <h5 className="font-medium text-green-700">Optimal Order Size</h5>
            <p className="text-green-800">
              {Math.round(Math.sqrt(2 * productThreshold.avg_daily_sales * 365 * 10 / 0.25))} units
            </p>
            <p className="text-xs text-green-600 mt-1">Based on EOQ formula with estimated holding cost</p>
          </div>
        </div>
      )}
    </div>
  );
}