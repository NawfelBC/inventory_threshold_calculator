export interface InventoryRecord {
  product_id: string;
  product_name: string;
  date: string;
  inventory_level: number;
  orders: number;
  lead_time_days: number;
}

export interface ThresholdParams {
  safetyStockPercentage: number;
  averageDailySales: number | null;
  useProductLeadTime: boolean;
  customLeadTime: number | string;
}

export interface ThresholdLevels {
  product_id: string;
  product_name: string;
  low: number;
  medium: number;
  high: number;
  lead_time_used: number;
  avg_daily_sales: number;
}

export interface ProductSummary {
  product_id: string;
  product_name: string;
  avg_inventory: number;
  avg_orders: number;
  avg_lead_time: number;
  data_points: number;
}