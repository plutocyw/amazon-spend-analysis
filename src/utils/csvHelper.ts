import Papa from 'papaparse';
import type { Order, ParsedOrder } from '../types';
import { parseISO } from 'date-fns';

export const parseCSV = (file: File): Promise<ParsedOrder[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<Order>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData: ParsedOrder[] = results.data
                    .filter(row => row['Order Date'] && row['Total Owed']) // Basic validation
                    .map((row) => {
                        // Clean up currency string "USD" etc if present, though sample showed just numbers roughly.
                        // Sample: "11.16"
                        // Wait, sample row 11: "'-5.77'". It seems some negative numbers have single quotes.
                        // Sample row 1: "12.18"

                        const cleanNumber = (val: string) => {
                            if (!val) return 0;
                            const clean = val.replace(/['"$,]/g, '');
                            return parseFloat(clean) || 0;
                        };

                        const quantity = parseInt(row['Quantity'] || '0', 10);

                        return {
                            ...row,
                            parsedDate: parseISO(row['Order Date']), // "2025-12-17T09:05:16Z" is ISO compatible
                            parsedAmount: cleanNumber(row['Total Owed']),
                            parsedQuantity: isNaN(quantity) ? 0 : quantity
                        };
                    });
                resolve(parsedData);
            },
            error: (error: Error) => {
                reject(error);
            }
        });
    });
};
