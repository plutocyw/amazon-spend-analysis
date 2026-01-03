import React, { useMemo } from 'react';
import type { ParsedOrder, Metric } from '../types';
import { DollarSign, ShoppingBag, Hash } from 'lucide-react';
import { format } from 'date-fns';

interface SummaryCardsProps {
    orders: ParsedOrder[];
    metric: Metric;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ orders, metric }) => {
    const stats = useMemo(() => {
        const totalAmount = orders.reduce((sum, o) => sum + o.parsedAmount, 0);
        const totalQuantity = orders.reduce((sum, o) => sum + o.parsedQuantity, 0);
        const count = orders.length;
        const avgOrderValue = count > 0 ? totalAmount / count : 0;

        // Sort by date to get range
        const sorted = [...orders].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
        const dateRange = sorted.length > 0
            ? `${format(sorted[0].parsedDate, 'MMM d, yyyy')} - ${format(sorted[sorted.length - 1].parsedDate, 'MMM d, yyyy')}`
            : 'No Data';

        return { totalAmount, totalQuantity, count, avgOrderValue, dateRange };
    }, [orders]);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const Card = ({ title, value, sub, icon: Icon, color }: any) => (
        <div className="glass-panel p-6 flex flex-col justify-between" style={{ minHeight: '140px' }}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-muted text-sm font-bold uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                </div>
                <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
                    <Icon size={24} color={color} />
                </div>
            </div>
            {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
    );

    const mainValue = metric === 'amount'
        ? formatter.format(stats.totalAmount)
        : stats.totalQuantity.toLocaleString();

    const mainTitle = metric === 'amount' ? 'Total Spent' : 'Total Units';

    return (
        <div className="grid grid-cols-3 gap-6 mb-6">
            <Card
                title={mainTitle}
                value={mainValue}
                sub={stats.dateRange}
                icon={metric === 'amount' ? DollarSign : ShoppingBag}
                color="#38bdf8"
            />
            <Card
                title="Total Orders"
                value={stats.count}
                sub="Individual transactions"
                icon={Hash}
                color="#a855f7"
            />
            <Card
                title="Avg. Order Value"
                value={formatter.format(stats.avgOrderValue)}
                sub="Per transaction"
                icon={DollarSign}
                color="#10b981"
            />
        </div>
    );
};
