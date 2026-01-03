import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { ParsedOrder, Metric } from '../../types';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

interface SpendingOverTimeProps {
    orders: ParsedOrder[];
    metric: Metric;
}

type Granularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const SpendingOverTime: React.FC<SpendingOverTimeProps> = ({ orders, metric }) => {
    const [granularity, setGranularity] = useState<Granularity>('day');

    const data = useMemo(() => {
        const grouped = orders.reduce((acc, order) => {
            const date = order.parsedDate;
            if (!date || isNaN(date.getTime())) return acc;

            let key: string;
            let displayDate: string;

            switch (granularity) {
                case 'week':
                    key = format(startOfWeek(date), 'yyyy-MM-dd');
                    displayDate = `Wk ${format(startOfWeek(date), 'MMM d')}`;
                    break;
                case 'month':
                    key = format(startOfMonth(date), 'yyyy-MM-01');
                    displayDate = format(date, 'MMM yyyy');
                    break;
                case 'quarter':
                    key = format(startOfQuarter(date), 'yyyy-MM-dd');
                    displayDate = `Q${format(date, 'Q yyyy')}`;
                    break;
                case 'year':
                    key = format(startOfYear(date), 'yyyy-01-01');
                    displayDate = format(date, 'yyyy');
                    break;
                case 'day':
                default:
                    key = format(date, 'yyyy-MM-dd');
                    displayDate = format(date, 'MMM d, yyyy');
                    break;
            }

            if (!acc[key]) {
                acc[key] = { date: key, value: 0, displayDate };
            }
            acc[key].value += metric === 'amount' ? order.parsedAmount : order.parsedQuantity;
            return acc;
        }, {} as Record<string, { date: string; value: number; displayDate: string }>);

        const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
        return result;
    }, [orders, metric, granularity]);

    const yAxisFormatter = (val: number) => {
        if (metric === 'quantity') return val.toString();
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val);
    };

    return (
        <div className="glass-panel p-6 h-96 w-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{metric === 'amount' ? 'Spending' : 'Quantity'} Over Time</h3>
                <div className="toggle-group text-xs">
                    {(['day', 'week', 'month', 'quarter', 'year'] as Granularity[]).map(g => (
                        <div
                            key={g}
                            className={`toggle-item ${granularity === g ? 'active' : ''}`}
                            onClick={() => setGranularity(g)}
                            style={{ padding: '0.25rem 0.75rem', textTransform: 'capitalize' }}
                        >
                            {g}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="var(--text-secondary)"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            tickMargin={10}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            tickFormatter={yAxisFormatter}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--glass-border)', borderRadius: '8px' }}
                            itemStyle={{ color: '#e2e8f0' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            formatter={(value: number | undefined) => [
                                metric === 'amount'
                                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
                                    : (value || 0),
                                metric === 'amount' ? 'Spent' : 'Units'
                            ]}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Bar
                            dataKey="value"
                            fill="var(--accent-color)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
