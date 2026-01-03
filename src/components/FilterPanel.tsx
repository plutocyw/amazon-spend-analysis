import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ParsedOrder, FilterState } from '../types';
import { Filter, X, Plus, Search } from 'lucide-react';

interface FilterPanelProps {
    orders: ParsedOrder[];
    filterState: FilterState;
    setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}

const ITEMS_PER_PAGE = 50;

export const FilterPanel: React.FC<FilterPanelProps> = ({ orders, filterState, setFilterState }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const modalRef = useRef<HTMLDivElement>(null);

    // Get columns that can be filtered
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

    // Get unique values for the editing column
    const uniqueValues = useMemo(() => {
        if (!editingColumn) return [];
        const values = new Set<string>();
        orders.forEach(o => {
            const val = o[editingColumn];
            if (typeof val === 'string' && val.trim()) values.add(val);
        });
        return Array.from(values).sort();
    }, [orders, editingColumn]);

    // Filter values by search
    const filteredValues = useMemo(() => {
        return uniqueValues.filter(val =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [uniqueValues, searchQuery]);

    // Active filters (columns with excluded values)
    const activeFilters = useMemo(() => {
        return Object.entries(filterState.columnFilters)
            .filter(([_, excluded]) => excluded.size > 0)
            .map(([column, excluded]) => ({ column, excludedCount: excluded.size }));
    }, [filterState.columnFilters]);

    // Reset search and visible count when editing column changes
    useEffect(() => {
        setSearchQuery('');
        setVisibleCount(ITEMS_PER_PAGE);
    }, [editingColumn]);

    const openModal = (column?: string) => {
        setEditingColumn(column || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingColumn(null);
        setSearchQuery('');
        setVisibleCount(ITEMS_PER_PAGE);
    };

    const toggleValue = (value: string) => {
        if (!editingColumn) return;
        setFilterState(prev => {
            const currentFilters = prev.columnFilters[editingColumn] || new Set();
            const newFilters = new Set(currentFilters);
            if (newFilters.has(value)) {
                newFilters.delete(value);
            } else {
                newFilters.add(value);
            }
            return {
                ...prev,
                columnFilters: {
                    ...prev.columnFilters,
                    [editingColumn]: newFilters
                }
            };
        });
    };

    const removeFilter = (column: string) => {
        setFilterState(prev => {
            const newFilters = { ...prev.columnFilters };
            delete newFilters[column];
            return { ...prev, columnFilters: newFilters };
        });
    };

    const isExcluded = (value: string) => {
        if (!editingColumn) return false;
        return filterState.columnFilters[editingColumn]?.has(value) || false;
    };

    const selectAll = () => {
        if (!editingColumn) return;
        setFilterState(prev => ({
            ...prev,
            columnFilters: {
                ...prev.columnFilters,
                [editingColumn]: new Set()
            }
        }));
    };

    const deselectAll = () => {
        if (!editingColumn) return;
        setFilterState(prev => ({
            ...prev,
            columnFilters: {
                ...prev.columnFilters,
                [editingColumn]: new Set(filteredValues)
            }
        }));
    };

    // Modal Portal
    const modal = isModalOpen ? createPortal(
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 9998,
                }}
                onClick={closeModal}
            />
            {/* Modal */}
            <div
                ref={modalRef}
                style={{
                    position: 'fixed',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 500,
                    maxHeight: '80vh',
                    background: '#0f172a',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                        {editingColumn ? `Filter: ${editingColumn}` : 'Add Filter'}
                    </h3>
                    <button
                        onClick={closeModal}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 20, flex: 1, overflow: 'auto' }}>
                    {/* Column Selector (only if not editing a specific column) */}
                    {!editingColumn && (
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
                                Select Column
                            </label>
                            <select
                                className="glass-input w-full"
                                value=""
                                onChange={(e) => setEditingColumn(e.target.value)}
                                style={{ fontSize: 14 }}
                            >
                                <option value="">-- Choose Column --</option>
                                {columns.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Value List */}
                    {editingColumn && (
                        <>
                            {/* Search */}
                            <div style={{ marginBottom: 12, position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Search values..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="glass-input w-full"
                                    style={{ paddingLeft: 36, fontSize: 14 }}
                                />
                            </div>

                            {/* Quick Actions */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 12 }}>
                                <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Include All
                                </button>
                                <button onClick={deselectAll} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Exclude All
                                </button>
                                <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                    {filteredValues.length} values
                                </span>
                            </div>

                            {/* Value List */}
                            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {filteredValues.slice(0, visibleCount).map(val => (
                                    <label
                                        key={val}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '8px 12px',
                                            background: isExcluded(val) ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            color: isExcluded(val) ? 'var(--text-secondary)' : 'var(--text-primary)',
                                            textDecoration: isExcluded(val) ? 'line-through' : 'none',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!isExcluded(val)}
                                            onChange={() => toggleValue(val)}
                                            style={{ accentColor: 'var(--accent-color)' }}
                                        />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {val || '(empty)'}
                                        </span>
                                    </label>
                                ))}

                                {/* Load More */}
                                {visibleCount < filteredValues.length && (
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                        style={{
                                            marginTop: 8,
                                            padding: '10px',
                                            background: 'rgba(56,189,248,0.1)',
                                            border: '1px solid var(--accent-color)',
                                            borderRadius: 6,
                                            color: 'var(--accent-color)',
                                            cursor: 'pointer',
                                            fontSize: 13,
                                        }}
                                    >
                                        Load More ({filteredValues.length - visibleCount} remaining)
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={closeModal}
                        style={{
                            padding: '8px 20px',
                            background: 'var(--accent-color)',
                            color: '#000',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Active Filter Chips */}
            {activeFilters.map(({ column, excludedCount }) => (
                <div
                    key={column}
                    className="glass-input flex items-center gap-2 text-sm cursor-pointer hover:border-accent-color"
                    style={{ padding: '6px 12px' }}
                    onClick={() => openModal(column)}
                >
                    <Filter size={14} className="text-accent-color" />
                    <span>{column}</span>
                    <span style={{ background: 'var(--danger)', color: 'white', fontSize: 11, padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>
                        {excludedCount} excluded
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); removeFilter(column); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}

            {/* Add Filter Button */}
            <button
                className="glass-input flex items-center gap-2 text-sm hover:border-accent-color"
                style={{ padding: '6px 12px', cursor: 'pointer' }}
                onClick={() => openModal()}
            >
                <Plus size={14} className="text-accent-color" />
                <span>Add Filter</span>
            </button>

            {modal}
        </div>
    );
};
