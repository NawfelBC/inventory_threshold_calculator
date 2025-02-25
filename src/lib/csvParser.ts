import Papa from 'papaparse';
import { InventoryRecord, ProductSummary } from './types';

export function parseCSV(file: File): Promise<InventoryRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const records: InventoryRecord[] = results.data.map((row: any, index: number) => {
            const missingColumns: string[] = [];
            
            if (!row.product_id) missingColumns.push('product_id');
            if (!row.product_name) missingColumns.push('product_name');
            if (!row.date) missingColumns.push('date');
            if (row.inventory_level === undefined) missingColumns.push('inventory_level');
            if (row.orders === undefined) missingColumns.push('orders');
            if (row.lead_time_days === undefined) missingColumns.push('lead_time_days');
            
            if (missingColumns.length > 0) {
              throw new Error(`Row ${index + 1}: Missing required columns: ${missingColumns.join(', ')}`);
            }
            
            return {
              product_id: String(row.product_id),
              product_name: String(row.product_name),
              date: String(row.date),
              inventory_level: Number(row.inventory_level),
              orders: Number(row.orders),
              lead_time_days: Number(row.lead_time_days)
            };
          });
          
          records.sort((a, b) => {
            if (a.product_id !== b.product_id) {
              return a.product_id.localeCompare(b.product_id);
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          
          resolve(records);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Unknown error parsing CSV'));
        }
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

export function getProductSummaries(data: InventoryRecord[]): ProductSummary[] {
  const productMap = new Map<string, {
    product_name: string;
    total_inventory: number;
    total_orders: number;
    total_lead_time: number;
    count: number;
  }>();
  
  data.forEach(record => {
    const existing = productMap.get(record.product_id);
    
    if (existing) {
      existing.total_inventory += record.inventory_level;
      existing.total_orders += record.orders;
      existing.total_lead_time += record.lead_time_days;
      existing.count += 1;
    } else {
      productMap.set(record.product_id, {
        product_name: record.product_name,
        total_inventory: record.inventory_level,
        total_orders: record.orders,
        total_lead_time: record.lead_time_days,
        count: 1
      });
    }
  });
  
  return Array.from(productMap.entries()).map(([product_id, summary]) => ({
    product_id,
    product_name: summary.product_name,
    avg_inventory: Math.round(summary.total_inventory / summary.count),
    avg_orders: Math.round((summary.total_orders / summary.count) * 100) / 100,
    avg_lead_time: Math.round((summary.total_lead_time / summary.count) * 10) / 10,
    data_points: summary.count
  }));
}