export interface Order {
    'Order ID': string;
    'Order Date': string;
    'Total Owed': string;
    'Quantity': string;
    'Product Name': string;
    'Payment Instrument Type': string;
    'Order Status': string;
    'Shipment Status': string;
    'Category': string;
    [key: string]: string | number | Date | undefined; // Allow mixed types for ParsedOrder compatibility
}

export interface ParsedOrder extends Order {
    parsedDate: Date;
    parsedAmount: number;
    parsedQuantity: number;
}

export type Metric = 'amount' | 'quantity';

export interface FilterState {
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    metric: Metric;
    columnFilters: Record<string, Set<string>>; // Column Name -> Set of selected values
}
