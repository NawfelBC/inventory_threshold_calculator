import { InventoryRecord, ThresholdParams, ThresholdLevels } from './types';

export function calculateThresholds(
  data: InventoryRecord[],
  params: ThresholdParams,
  selectedProductId?: string
): ThresholdLevels[] {
  const productGroups = new Map<string, InventoryRecord[]>();
  
  data.forEach(record => {
    if (selectedProductId && record.product_id !== selectedProductId) {
      return;
    }
    
    const existing = productGroups.get(record.product_id) || [];
    existing.push(record);
    productGroups.set(record.product_id, existing);
  });
  
  const results: ThresholdLevels[] = [];
  
  productGroups.forEach((records, productId) => {
    if (records.length === 0) return;
    
    const productName = records[0].product_name;
    
    let avgDailySales: number;
    if (params.averageDailySales === null) {
      const totalOrders = records.reduce((sum, record) => sum + record.orders, 0);
      avgDailySales = totalOrders / records.length;
    } else {
      avgDailySales = params.averageDailySales;
    }
    
    let leadTime: number;
    if (params.useProductLeadTime) {
      leadTime = records.reduce((sum, record) => sum + record.lead_time_days, 0) / records.length;
    } else {
      leadTime = typeof params.customLeadTime === 'string' ? 
        Number(params.customLeadTime) : params.customLeadTime;
    }
    
    const leadTimeDemand = avgDailySales * leadTime;
    
    const safetyStock = leadTimeDemand * (params.safetyStockPercentage / 100);
    
    const low = leadTimeDemand + safetyStock;
    const medium = low * 1.5;
    const high = low * 2;
    
    results.push({
      product_id: productId,
      product_name: productName,
      low: Math.round(low),
      medium: Math.round(medium),
      high: Math.round(high),
      lead_time_used: Math.round(leadTime * 10) / 10,
      avg_daily_sales: Math.round(avgDailySales * 100) / 100
    });
  });
  
  return results;
}