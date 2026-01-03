import React from 'react';
import { subYears, startOfYear, endOfYear, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import type { FilterState, Metric } from '../types';
import { Calendar, DollarSign, Package } from 'lucide-react';

interface ControlsProps {
    filterState: FilterState;
    setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const Controls: React.FC<ControlsProps> = ({ filterState, setFilterState }) => {

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        const date = value ? new Date(value) : null;
        setFilterState((prev: FilterState) => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: date
            }
        }));
    };

    const handleMetricChange = (metric: Metric) => {
        setFilterState((prev: FilterState) => ({ ...prev, metric }));
    };

    const applyPreset = (preset: 'lastYear' | 'ytd' | 'lastMonth' | 'past6Months') => {
        const now = new Date();
        let start: Date, end: Date;

        switch (preset) {
            case 'lastYear':
                start = startOfYear(subYears(now, 1));
                end = endOfYear(subYears(now, 1));
                break;
            case 'ytd':
                start = startOfYear(now);
                end = now;
                break;
            case 'lastMonth':
                start = startOfMonth(subMonths(now, 1));
                end = endOfMonth(subMonths(now, 1));
                break;
            case 'past6Months':
                start = subMonths(now, 6);
                end = now;
                break;
        }

        setFilterState(prev => ({
            ...prev,
            dateRange: { start, end }
        }));
    };

    return (
        <div className="glass-panel w-full p-6 mb-6 flex flex-col gap-6">
            {/* Presets Row */}
            <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0">
                <button onClick={() => applyPreset('lastYear')} className="glass-input text-xs hover:border-accent-color transition-colors whitespace-nowrap">Last Year</button>
                <button onClick={() => applyPreset('ytd')} className="glass-input text-xs hover:border-accent-color transition-colors whitespace-nowrap">Year to Date</button>
                <button onClick={() => applyPreset('lastMonth')} className="glass-input text-xs hover:border-accent-color transition-colors whitespace-nowrap">Last Month</button>
                <button onClick={() => applyPreset('past6Months')} className="glass-input text-xs hover:border-accent-color transition-colors whitespace-nowrap">Past 6 Months</button>
            </div>

            <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>

                {/* Date Range Picker */}
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-muted">
                        <Calendar size={20} />
                        <span className="font-bold">Date Range</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="glass-input"
                            value={filterState.dateRange.start?.toISOString().split('T')[0] || ''}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                        />
                        <span className="text-muted self-center">to</span>
                        <input
                            type="date"
                            className="glass-input"
                            value={filterState.dateRange.end?.toISOString().split('T')[0] || ''}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                        />
                    </div>
                </div>

                {/* Metric Selector */}
                <div className="flex gap-4 items-center">
                    <span className="text-muted font-bold">Metric</span>
                    <div className="toggle-group">
                        <div
                            className={`toggle-item flex items-center gap-2 ${filterState.metric === 'amount' ? 'active' : ''}`}
                            onClick={() => handleMetricChange('amount')}
                        >
                            <DollarSign size={16} />
                            Amount Spent
                        </div>
                        <div
                            className={`toggle-item flex items-center gap-2 ${filterState.metric === 'quantity' ? 'active' : ''}`}
                            onClick={() => handleMetricChange('quantity')}
                        >
                            <Package size={16} />
                            Quantity
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
