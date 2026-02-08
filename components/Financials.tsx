import React, { useEffect, useState } from 'react';
import { FinancialRecord } from '../types';
import { supabase } from '../src/lib/supabase';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Plus, X, Calendar, Search, Wallet, Filter } from 'lucide-react';

export const Financials: React.FC = () => {
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Date Range State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [newRecord, setNewRecord] = useState<Partial<FinancialRecord>>({
        description: '',
        amount: 0,
        type: 'expense',
        category: 'Outros',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchFinancials();
    }, []);

    const fetchFinancials = async () => {
        try {
            setLoading(true);

            // 1. Fetch Patient Payments (Income)
            const { data: payments, error: payError } = await supabase
                .from('patient_payments')
                .select(`
                    id,
                    date,
                    amount,
                    procedure,
                    patients (name)
                `)
                .order('date', { ascending: false });

            if (payError) throw payError;

            // 2. Fetch Other Financial Records (Expenses/Income)
            const { data: finRecords, error: finError } = await supabase
                .from('financial_records')
                .select('*')
                .order('date', { ascending: false });

            if (finError) throw finError;

            // Normalize and Merge
            const normalizedPayments: FinancialRecord[] = (payments as any[] || []).map(p => ({
                id: p.id,
                date: p.date,
                amount: p.amount,
                description: `${p.procedure} - ${p.patients?.name || 'Cliente'}`,
                type: 'income',
                category: 'Procedimento'
            }));

            const normalizedRecords: FinancialRecord[] = (finRecords || []).map(r => ({
                id: r.id,
                date: r.date,
                amount: r.amount,
                description: r.description,
                type: r.type as 'income' | 'expense',
                category: r.category
            }));

            const combined = [...normalizedPayments, ...normalizedRecords];
            // Sort by date desc
            combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setRecords(combined);

        } catch (error) {
            console.error('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRecord.description || !newRecord.amount) return;

        try {
            const { error } = await supabase
                .from('financial_records')
                .insert({
                    description: newRecord.description,
                    amount: Number(newRecord.amount),
                    type: newRecord.type,
                    category: newRecord.category,
                    date: newRecord.date
                });

            if (error) throw error;

            await fetchFinancials();
            setIsModalOpen(false);
            setNewRecord({
                description: '',
                amount: 0,
                type: 'expense',
                category: 'Outros',
                date: new Date().toISOString().split('T')[0]
            });

        } catch (error) {
            console.error('Error adding record:', error);
            alert('Erro ao salvar registro.');
        }
    };

    // Derived State for Stats using Date Range
    const filteredRecords = records.filter(r => {
        if (!startDate && !endDate) return true;
        if (startDate && !endDate) return r.date >= startDate;
        if (!startDate && endDate) return r.date <= endDate;
        return r.date >= startDate && r.date <= endDate;
    });

    const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = filteredRecords.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center">

                {/* Date Filters */}
                <div className="glass-card flex flex-col sm:flex-row items-center p-2 rounded-xl border border-white/10 gap-2 w-full xl:w-auto">
                    <div className="flex items-center px-3 gap-2 text-gold-400 border-r border-white/10 pr-4 w-full sm:w-auto mb-2 sm:mb-0">
                        <Filter size={18} />
                        <span className="text-sm font-medium whitespace-nowrap">Período:</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 outline-none text-sm text-text-primary [color-scheme:dark] w-full sm:w-auto"
                            placeholder="De"
                        />
                        <span className="text-text-muted text-xs">até</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 outline-none text-sm text-text-primary [color-scheme:dark] w-full sm:w-auto"
                            placeholder="Até"
                        />
                    </div>

                    {(startDate || endDate) && (
                        <button
                            onClick={clearFilters}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-400 transition-colors ml-auto sm:ml-0"
                            title="Limpar Filtros"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98] w-full md:w-auto justify-center"
                >
                    <Plus size={20} /> Novo Lançamento
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2 z-10 relative">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <ArrowUpCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">Entradas</span>
                    </div>
                    <p className="text-3xl font-serif font-bold text-text-primary z-10 relative">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
                    </p>
                    <div className="absolute right-[-20px] bottom-[-20px] text-emerald-500 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                        <ArrowUpCircle size={120} />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2 z-10 relative">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                            <ArrowDownCircle size={20} />
                        </div>
                        <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">Saídas</span>
                    </div>
                    <p className="text-3xl font-serif font-bold text-text-primary z-10 relative">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
                    </p>
                    <div className="absolute right-[-20px] bottom-[-20px] text-red-500 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                        <ArrowDownCircle size={120} />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden border-gold-500/30 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-transparent opacity-50"></div>
                    <div className="flex items-center gap-3 mb-2 z-10 relative">
                        <div className="p-2 rounded-lg bg-gold-500/20 text-gold-400">
                            <Wallet size={20} />
                        </div>
                        <span className="text-sm font-medium text-gold-200 uppercase tracking-wider">Saldo {startDate || endDate ? '(Período)' : 'Geral'}</span>
                    </div>
                    <p className={`text-4xl font-serif font-bold z-10 relative ${balance >= 0 ? 'text-gold-400' : 'text-red-400'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                    </p>
                    <div className="absolute right-[-20px] bottom-[-20px] text-gold-500 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign size={120} />
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-highlight/30">
                    <h3 className="font-serif font-bold text-text-primary text-lg">Fluxo Detalhado</h3>
                    <span className="text-xs text-gold-500/70 font-medium uppercase tracking-widest hidden sm:block">
                        {startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'Todos os lançamentos'}
                    </span>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-text-muted">Carregando dados...</div>
                ) : filteredRecords.length === 0 ? (
                    <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
                        <Search size={32} className="opacity-20" />
                        <p>Nenhum registro encontrado para o período.</p>
                        {(startDate || endDate) && (
                            <button onClick={clearFilters} className="text-gold-400 hover:underline text-sm mt-2">
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-highlight border-b border-white/5">
                                <tr>
                                    <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Data</th>
                                    <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Descrição</th>
                                    <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Categoria</th>
                                    <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5 text-sm text-text-secondary font-mono opacity-80">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="p-5 text-sm font-medium text-text-primary">{record.description}</td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-text-secondary border border-white/10">
                                                {record.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className={`p-5 text-sm font-bold text-right font-mono ${record.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {record.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal - New Record */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-card rounded-2xl max-w-md w-full animate-in zoom-in duration-300 overflow-hidden shadow-2xl border border-white/10">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-surface-highlight/50">
                            <h3 className="font-serif font-bold text-text-primary text-xl">Novo Lançamento</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddRecord} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Tipo de Movimentação</label>
                                <div className="flex bg-surface-highlight p-1 rounded-xl border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setNewRecord({ ...newRecord, type: 'income' })}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${newRecord.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/20' : 'text-text-muted hover:text-text-secondary'}`}
                                    >
                                        Entrada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewRecord({ ...newRecord, type: 'expense' })}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${newRecord.type === 'expense' ? 'bg-red-500/20 text-red-400 shadow-sm border border-red-500/20' : 'text-text-muted hover:text-text-secondary'}`}
                                    >
                                        Saída
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={newRecord.type === 'expense' ? "Ex: Compra de Insumos" : "Ex: Procedimento Extra"}
                                    value={newRecord.description}
                                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                    className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0,00"
                                        value={newRecord.amount || ''}
                                        onChange={(e) => setNewRecord({ ...newRecord, amount: Number(e.target.value) })}
                                        className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50 font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Data</label>
                                    <input
                                        type="date"
                                        required
                                        value={newRecord.date}
                                        onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                                        className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Categoria</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary appearance-none cursor-pointer"
                                        value={newRecord.category}
                                        onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                                    >
                                        <option className="bg-surface text-text-primary">Outros</option>
                                        <option className="bg-surface text-text-primary">Insumos/Estoque</option>
                                        <option className="bg-surface text-text-primary">Aluguel/Contas</option>
                                        <option className="bg-surface text-text-primary">Marketing</option>
                                        <option className="bg-surface text-text-primary">Serviços</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                        <ArrowDownCircle size={16} />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 mt-2 uppercase tracking-wide text-sm">
                                Salvar Lançamento
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};