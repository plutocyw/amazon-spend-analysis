import React, { useMemo, useState } from 'react';
import type { ParsedOrder, FilterState } from '../types';
import { Controls } from './Controls';
import { SummaryCards } from './SummaryCards';
import { SpendingOverTime } from './Charts/SpendingOverTime';
import { BreakdownChart } from './Charts/BreakdownChart';
import { FilterPanel } from './FilterPanel';
import { isWithinInterval, subYears, startOfYear, endOfYear } from 'date-fns';

interface DashboardProps {
    orders: ParsedOrder[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
    const [filterState, setFilterState] = useState<FilterState>(() => {
        const lastYearDate = subYears(new Date(), 1);
        return {
            dateRange: {
                start: startOfYear(lastYearDate),
                end: endOfYear(lastYearDate)
            },
            metric: 'amount',
            columnFilters: {},
        };
    });

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Date Filter
            if (filterState.dateRange.start && filterState.dateRange.end) {
                if (!isWithinInterval(order.parsedDate, {
                    start: filterState.dateRange.start,
                    end: filterState.dateRange.end
                })) {
                    return false;
                }
            }

            // Column Filters (Exclusion logic)
            for (const [col, excludedValues] of Object.entries(filterState.columnFilters)) {
                const val = order[col];
                if (typeof val === 'string' && excludedValues.has(val)) {
                    return false;
                }
            }

            return true;
        });
    }, [orders, filterState]);

    return (
        <div className="w-full animation-fade-in">
            <div className="flex flex-col gap-4 mb-6">
                <Controls filterState={filterState} setFilterState={setFilterState} />

                <div className="flex justify-start px-2">
                    <FilterPanel orders={orders} filterState={filterState} setFilterState={setFilterState} />
                </div>
            </div>

            <SummaryCards orders={filteredOrders} metric={filterState.metric} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Full width row for Spending Over Time */}
                <div className="md:col-span-2">
                    <SpendingOverTime orders={filteredOrders} metric={filterState.metric} />
                </div>

                {/* Breakdown Chart */}
                <div className="md:col-span-2">
                    <BreakdownChart orders={filteredOrders} metric={filterState.metric} />
                </div>
            </div>
        </div>
    );
};
