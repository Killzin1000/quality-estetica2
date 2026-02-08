import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { AlertTriangle, TrendingUp, Users, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface DashboardProps {
    products: Product[];
}

export const Dashboard: React.FC<DashboardProps> = ({ products }) => {
    const [stats, setStats] = useState({
        revenueToday: 0,
        appointmentsToday: 0,
        newPatientsMonth: 0
    });
    const [loading, setLoading] = useState(true);

    // Logic to find expiring and low stock items (keep using props for products as they might be passed from App state or fetched here too)
    // Ideally, Dashboard should probably fetch its own alerts if independent, but let's respect props if valid.
    // However, user asked for REAL data from DB. The products prop in App.tsx is MOCKED.
    // So we should probably ignore props.products for the alerts OR expect App.tsx to fetch them.
    // Let's assume we fetch everything here for "Real Data" request to be safe.

    const [realProducts, setRealProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

            // 1. Revenue Today (Sum of payments)
            const { data: payments } = await supabase
                .from('patient_payments')
                .select('amount')
                .gte('date', today + 'T00:00:00') // assuming date is stored as ISO string or partial
                .lte('date', today + 'T23:59:59');

            const revenue = (payments as any[])?.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0;

            // 2. Appointments Today
            const { count: appointmentsCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .gte('date', today + 'T00:00:00')
                .lte('date', today + 'T23:59:59');

            // 3. New Patients Month
            const { count: newPatientsCount } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', firstDayOfMonth);

            // 4. Products for alerts
            const { data: dbProducts } = await supabase.from('products').select('*');

            setStats({
                revenueToday: revenue,
                appointmentsToday: appointmentsCount || 0,
                newPatientsMonth: newPatientsCount || 0
            });

            if (dbProducts) {
                const mappedProducts: Product[] = (dbProducts as any[]).map(p => ({
                    id: p.id,
                    name: p.name,
                    brand: p.brand || '',
                    lotNumber: p.lot_number || '',
                    expiryDate: p.expiry_date || '',
                    costPrice: p.cost_price || 0,
                    salePrice: p.sale_price || 0,
                    supplier: p.supplier || '',
                    quantity: p.quantity || 0
                }));
                setRealProducts(mappedProducts);
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    const expiringProducts = realProducts.filter(p => {
        if (!p.expiryDate) return false;
        const expiry = new Date(p.expiryDate);
        return p.quantity > 0 && expiry > today && expiry <= nextMonth;
    });

    const lowStockProducts = realProducts.filter(p => p.quantity < 5);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-gold-500" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center gap-5 group hover:border-gold-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 text-gold-400 flex items-center justify-center shadow-lg shadow-gold-900/20 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold mb-1">Faturamento Hoje</p>
                        <h3 className="text-2xl font-serif font-bold text-text-primary group-hover:text-gold-300 transition-colors">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenueToday)}
                        </h3>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center gap-5 group hover:border-gold-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-surface-highlight text-blue-400 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold mb-1">Agendamentos</p>
                        <h3 className="text-2xl font-serif font-bold text-text-primary">{stats.appointmentsToday}</h3>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center gap-5 group hover:border-gold-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-surface-highlight text-emerald-400 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold mb-1">Novos Pacientes</p>
                        <h3 className="text-2xl font-serif font-bold text-text-primary">{stats.newPatientsMonth}</h3>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center gap-5 group hover:border-red-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-red-900/20 text-red-400 flex items-center justify-center border border-red-500/10 group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold mb-1">Alertas</p>
                        <h3 className="text-2xl font-serif font-bold text-text-primary">
                            {expiringProducts.length + lowStockProducts.length}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle size={100} className="text-gold-500" />
                    </div>

                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-3 relative z-10">
                        <AlertTriangle className="text-gold-500" size={20} />
                        Lotes Vencendo <span className="text-text-secondary text-sm font-normal">(30 dias)</span>
                    </h3>

                    {expiringProducts.length === 0 ? (
                        <p className="text-text-muted text-sm italic">Nenhum produto vencendo em breve.</p>
                    ) : (
                        <div className="space-y-3 relative z-10">
                            {expiringProducts.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-surface/50 rounded-xl border border-white/5 hover:border-gold-500/30 transition-all">
                                    <div>
                                        <p className="font-medium text-gold-100 text-sm">{p.name}</p>
                                        <p className="text-xs text-text-secondary mt-1">Lote: {p.lotNumber}</p>
                                    </div>
                                    <span className="text-xs font-bold text-gold-900 bg-gold-400 px-3 py-1 rounded-full shadow-lg shadow-gold-500/20">
                                        {new Date(p.expiryDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle size={100} className="text-red-500" />
                    </div>

                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-3 relative z-10">
                        <AlertTriangle className="text-red-500" size={20} />
                        Estoque Baixo
                    </h3>

                    {lowStockProducts.length === 0 ? (
                        <p className="text-text-muted text-sm italic">Estoque saudável.</p>
                    ) : (
                        <div className="space-y-3 relative z-10">
                            {lowStockProducts.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-surface/50 rounded-xl border border-white/5 hover:border-red-500/30 transition-all">
                                    <div>
                                        <p className="font-medium text-red-200 text-sm">{p.name}</p>
                                        <p className="text-xs text-text-secondary mt-1">{p.brand}</p>
                                    </div>
                                    <span className="text-xs font-bold text-red-100 bg-red-900/50 border border-red-500/20 px-3 py-1 rounded-full">
                                        Restam: {p.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};