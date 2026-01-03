import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ParsedOrder, Metric } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { ChevronDown } from 'lucide-react';

interface BreakdownChartProps {
    orders: ParsedOrder[];
    metric: Metric;
}

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185', '#fcd34d'];

export const BreakdownChart: React.FC<BreakdownChartProps> = ({ orders, metric }) => {
    const [breakdownCol, setBreakdownCol] = useState('Payment Instrument Type');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [topN, setTopN] = useState(5);
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const columns = useMemo(() => {
        if (orders.length === 0) return [];
        const sample = orders[0];
        return Object.keys(sample).filter(key =>
            !key.startsWith('parsed') &&
            key !== 'Order ID' &&
            key !== 'Total Owed' &&
            key !== 'Quantity' &&
            key !== 'Order Date'
        ).sort();
    }, [orders]);

    useEffect(() => {
        if (columns.length > 0 && !columns.includes(breakdownCol)) {
            setBreakdownCol(columns[0]);
        }
    }, [columns, breakdownCol]);

    useEffect(() => {
        if (isDropdownOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 200)
            });
        }
    }, [isDropdownOpen]);

    // Close dropdown on outside scroll or resize - but NOT on scroll inside menu
    useEffect(() => {
        if (!isDropdownOpen) return;

        const handleScroll = (e: Event) => {
            // Don't close if scrolling inside the menu
            if (menuRef.current && menuRef.current.contains(e.target as Node)) {
                return;
            }
            setIsDropdownOpen(false);
        };

        const handleResize = () => setIsDropdownOpen(false);

        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isDropdownOpen]);

    const { data, othersValue, othersCount } = useMemo(() => {
        const grouped = orders.reduce((acc, order) => {
            const key = (order[breakdownCol] as string) || '(empty)';
            if (!acc[key]) acc[key] = 0;
            acc[key] += metric === 'amount' ? order.parsedAmount : order.parsedQuantity;
            return acc;
        }, {} as Record<string, number>);

        let sorted = Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        sorted = sorted.filter(i => i.value > 0);
        const top = sorted.slice(0, topN);
        const others = sorted.slice(topN);

        const othersValue = others.length > 0
            ? others.reduce((sum, item) => sum + item.value, 0)
            : 0;

        return { data: top, othersValue, othersCount: others.length };
    }, [orders, metric, breakdownCol, topN]);

    const tooltipFormatter = (val: number) => {
        if (metric === 'quantity') return val.toString();
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const CustomYAxisTick = (props: any) => {
        const { x, y, payload } = props;
        const maxLength = 25;
        const text = payload.value;
        const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        return (
            <g transform={`translate(${x},${y})`}>
                <title>{text}</title>
                <text x={0} y={0} dy={4} textAnchor="end" fill="var(--text-secondary)" fontSize={11}>
                    {truncated}
                </text>
            </g>
        );
    };

    // Dropdown Portal - renders at document.body level
    const dropdownPortal = isDropdownOpen ? createPortal(
        <>
            {/* Backdrop - captures all clicks outside */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                    background: 'transparent',
                }}
                onClick={() => setIsDropdownOpen(false)}
            />
            {/* Menu - blocks all events */}
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    minWidth: dropdownPosition.width,
                    maxHeight: 300,
                    overflowY: 'auto',
                    zIndex: 9999,
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    padding: 4,
                }}
            >
                {columns.map(c => (
                    <button
                        key={c}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            fontSize: 14,
                            color: breakdownCol === c ? '#38bdf8' : '#94a3b8',
                            background: breakdownCol === c ? 'rgba(56,189,248,0.15)' : 'transparent',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                            if (breakdownCol !== c) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (breakdownCol !== c) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                        onClick={() => {
                            setBreakdownCol(c);
                            setIsDropdownOpen(false);
                        }}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Breakdown</h3>
                <div className="flex gap-2 items-center">
                    <button
                        ref={buttonRef}
                        className="glass-input text-sm flex items-center gap-2 hover:border-accent-color transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ minWidth: 180, justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                        <span className="truncate">{breakdownCol}</span>
                        <ChevronDown size={14} className="text-muted flex-shrink-0" />
                    </button>

                    <div className="toggle-group">
                        <div className={`toggle-item ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>Bar</div>
                        <div className={`toggle-item ${chartType === 'pie' ? 'active' : ''}`} onClick={() => setChartType('pie')}>Pie</div>
                    </div>
                </div>
            </div>

            {dropdownPortal}

            <div style={{ flex: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis
                                type="number"
                                stroke="var(--text-secondary)"
                                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                tickFormatter={(val) => metric === 'amount' ? `$${val}` : val.toString()}
                            />
                            <YAxis dataKey="name" type="category" width={180} tick={<CustomYAxisTick />} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: 'var(--glass-border)',
                                    borderRadius: 8,
                                    padding: '12px 16px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                }}
                                wrapperStyle={{ zIndex: 1000 }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(val: number | undefined) => [tooltipFormatter(val || 0), metric]}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie data={data} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--glass-border)', borderRadius: 8, maxWidth: 300 }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(val: number | undefined) => [tooltipFormatter(val || 0), metric]}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted">
                    <span>Show top</span>
                    <input
                        type="number"
                        min="1" max="50"
                        value={topN}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1 && val <= 50) {
                                setTopN(val);
                            }
                        }}
                        className="glass-input w-14 text-center text-sm py-1"
                        style={{ appearance: 'textfield' }}
                    />
                    <span>items</span>
                </div>
                {othersCount > 0 && (
                    <div className="text-muted text-right">
                        <span className="opacity-70">+{othersCount} others: </span>
                        <span className="text-accent-color font-medium">
                            {metric === 'amount'
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(othersValue)
                                : othersValue.toLocaleString()
                            }
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
