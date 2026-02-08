import React, { useEffect, useState } from 'react';
import { Search, Plus, Users, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { Patient } from '../types';
import { PatientForm } from './PatientForm';

interface PatientListProps {
    onSelectPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('name');

            if (error) throw error;

            if (data) {
                const mappedPatients: Patient[] = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    age: p.age || 0,
                    phone: p.phone || '',
                    photoUrl: p.photo_url || undefined
                }));
                setPatients(mappedPatients);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientCreated = (newPatient: Patient) => {
        setPatients(prev => [newPatient, ...prev]);
        setIsFormOpen(false);
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-gold-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar paciente por nome ou telefone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
                    />
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold py-3.5 px-6 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98]"
                >
                    <Plus size={20} />
                    <span>Novo Paciente</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gold-400/50">
                    <Loader2 size={40} className="animate-spin mb-4 text-gold-500" />
                    <p className="font-serif">Carregando pacientes...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted glass-card rounded-2xl border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 border border-white/5">
                        <Users size={40} className="opacity-30 text-gold-200" />
                    </div>
                    <p className="text-xl font-serif font-medium text-text-secondary">Nenhum paciente encontrado</p>
                    <p className="text-sm mt-2 opacity-60">Cadastre um novo paciente para começar seu atendimento exclusivo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredPatients.map(patient => (
                        <div
                            key={patient.id}
                            onClick={() => onSelectPatient(patient)}
                            className="group glass-card p-5 rounded-2xl hover:border-gold-500/30 transition-all cursor-pointer flex items-center gap-5 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="w-16 h-16 rounded-full bg-surface-highlight flex-shrink-0 flex items-center justify-center text-gold-400 font-serif font-bold text-xl overflow-hidden border border-white/10 group-hover:border-gold-500/50 shadow-lg shadow-black/20 transition-all">
                                {patient.photoUrl ? (
                                    <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                                ) : (
                                    patient.name.charAt(0)
                                )}
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                                <h4 className="font-bold text-text-primary text-lg truncate group-hover:text-gold-200 transition-colors font-serif">{patient.name}</h4>
                                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                                    {patient.age ? `${patient.age} anos` : 'Idade não informada'}
                                </p>
                                <p className="text-xs text-text-muted mt-1 font-mono tracking-wide opacity-80">{patient.phone || 'Sem telefone'}</p>
                            </div>
                            <div className="text-white/10 group-hover:text-gold-400 transition-colors group-hover:translate-x-1 duration-300">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <PatientForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handlePatientCreated}
                />
            )}
        </div>
    );
};
