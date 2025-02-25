# Inventory Threshold Optimizer

A modern web application that helps logistics managers optimize inventory thresholds based on historical data. This tool allows users to upload CSV data, calculate optimal inventory levels, visualize thresholds, and export recommendations.

## Features

- **CSV Data Upload**: Easily import historical inventory and order data
- **Product-Based Analysis**: Calculate thresholds for individual products or your entire inventory
- **Customizable Parameters**: Configure safety stock percentages and lead times
- **Interactive Visualization**: View inventory levels and thresholds on dynamic charts
- **Export Options**: Download recommendations in JSON or CSV format

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NawfelBC/inventory_threshold_calculator.git
   cd inventory_threshold_calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Sample Data

A sample CSV file is available in the `public/` folder that you can use to test the application. You can download this file directly from the application by visiting [http://localhost:3000/sample_data.csv](http://localhost:3000/sample_data.csv) or use it as a template to format your own data.

### Building for Production
```bash
npm run build
npm run start
```

## Component Architecture

The application follows a modular component architecture:

### Core Components

- **FileUpload**: Handles CSV file uploads with drag-and-drop functionality
- **ThresholdForm**: Provides configurable parameters for threshold calculations
- **InventoryChart**: Visualizes inventory levels and calculated thresholds with multiple chart types (line, area, and stock flow)
- **ThresholdResults**: Displays calculated threshold recommendations with expandable product details
- **ExportSection**: Enables exporting results in JSON or CSV format

### Data Flow

1. User uploads CSV data via `FileUpload`
2. Data is parsed and stored in the application state
3. User can view product summaries via the "Product Summary" modal
4. User configures parameters in `ThresholdForm` and can select specific products
5. Calculations are performed using the `thresholdCalculator` utility
6. Results are displayed in `ThresholdResults` and `InventoryChart`
7. User can export results via `ExportSection`

### Utility Modules

- **csvParser**: Handles CSV file parsing, data validation, and product summary generation
- **thresholdCalculator**: Contains the business logic for threshold calculations
- **types**: Defines TypeScript interfaces for type safety

## Threshold Calculation Algorithm

The application uses a sophisticated algorithm to determine optimal inventory thresholds:

### Input Parameters

- **Lead Time**: Time required to restock inventory (days) - can be from data or custom
- **Safety Stock Percentage**: Buffer percentage above lead time demand
- **Average Daily Sales**: Can be calculated from data or provided as a custom value
- **Product Selection**: Calculate for all products or a specific product

### Calculation Steps

1. **Data Preparation**:
   - Group data by product ID
   - Calculate average daily sales if not provided
   - Determine lead time (from data or custom value)

2. **Lead Time Demand Calculation**:
   ```
   leadTimeDemand = averageDailySales × leadTime
   ```

3. **Safety Stock Calculation**:
   ```
   safetyStock = leadTimeDemand × (safetyStockPercentage / 100)
   ```

4. **Threshold Determination**:
   - **Low Threshold**: `leadTimeDemand + safetyStock`
   - **Medium Threshold**: `low × 1.5`
   - **High Threshold**: `low × 2`

### Interpretation

- **Low Threshold**: Reorder immediately to avoid stockouts
- **Medium Threshold**: Plan to reorder soon
- **High Threshold**: Optimal stock level for efficient operations

### Additional Insights

The application also provides:
- Inventory turnover metrics
- Stock-out risk analysis
- Optimal order size recommendations
- Days of supply calculations

## CSV Data Format

The application expects CSV files with the following columns:

```
product_id,product_name,date,inventory_level,orders,lead_time_days
SKU123,Widget A,2023-01-01,150,23,5
SKU123,Widget A,2023-01-02,127,18,5
...
```

- **product_id**: Unique identifier for the product
- **product_name**: Name of the product
- **date**: Date of the inventory record (YYYY-MM-DD)
- **inventory_level**: Current inventory level
- **orders**: Number of orders for that day
- **lead_time_days**: Lead time for restocking in days

## Technologies Used

- **Next.js**: React framework for the frontend
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For responsive and modern UI design
- **Recharts**: For data visualization
- **PapaParse**: For CSV parsing
- **React Dropzone**: For drag-and-drop file uploads