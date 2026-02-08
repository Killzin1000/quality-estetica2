import React, { useState } from 'react';
import { X, Save, Upload, Loader2, User, Phone, Calendar } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { Patient } from '../types';

interface PatientFormProps {
    onClose: () => void;
    onSuccess: (patient: Patient) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        phone: '',
        photoUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!formData.name) return;

            const newPatient = {
                name: formData.name,
                age: formData.age ? parseInt(formData.age) : null,
                phone: formData.phone,
                photo_url: formData.photoUrl || null
            };

            const { data, error } = await supabase
                .from('patients')
                .insert(newPatient)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                const createdPatient: Patient = {
                    id: data.id,
                    name: data.name,
                    age: data.age || 0,
                    phone: data.phone || '',
                    photoUrl: data.photo_url || undefined
                };
                onSuccess(createdPatient);
            }
        } catch (error) {
            console.error('Error creating patient:', error);
            alert('Erro ao cadastrar paciente. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border border-white/10">
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-surface-highlight/50">
                    <h3 className="font-serif font-bold text-text-primary text-xl flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
                            <User size={20} />
                        </div>
                        Novo Paciente
                    </h3>
                    <button onClick={onClose} className="text-text-muted hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Nome Completo *</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={18} />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                                placeholder="Ex: Maria Silva"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Idade</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={18} />
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                                    placeholder="Ex: 30"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Telefone</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={18} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Foto (URL)</label>
                        <div className="flex gap-3">
                            <div className="relative group flex-1">
                                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold-400 transition-colors" size={18} />
                                <input
                                    type="url"
                                    value={formData.photoUrl}
                                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="w-14 h-14 bg-surface-highlight rounded-xl flex items-center justify-center text-text-muted border border-white/10 shrink-0 overflow-hidden">
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <User size={24} className="opacity-50" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 px-4 bg-transparent border border-white/10 text-text-secondary font-medium rounded-xl hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
