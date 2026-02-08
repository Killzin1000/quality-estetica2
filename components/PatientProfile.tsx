import React, { useState, useEffect } from 'react';
import { Patient, AnamnesisField, BodyMarker, PatientPayment, Appointment, Product, ClinicalNote } from '../types';
import { ClinicalNotes } from './ClinicalNotes';
import { Camera, FileText, Activity, Image as ImageIcon, CheckCircle, Upload, CreditCard, Calendar, Trash2, X, Package, Ruler, DollarSign, Split } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface PatientProfileProps {
    patient: Patient;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'anamnesis' | 'bodymap' | 'photos' | 'payments'>('info');
    const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

    // Existing States
    const [anamnesisData, setAnamnesisData] = useState<AnamnesisField[]>([
        { id: '1', label: 'Possui alergias?', type: 'boolean', value: false },
        { id: '2', label: 'Quais alergias?', type: 'text', value: '' },
        { id: '3', label: 'Tipo de Pele', type: 'select', options: ['Seca', 'Oleosa', 'Mista', 'Normal'], value: 'Mista' },
        { id: '4', label: 'Uso de medicamentos?', type: 'text', value: '' },
    ]);
    const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);

    // Payments Tab States
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [payments, setPayments] = useState<PatientPayment[]>([]);

    // Photos State
    const [photos, setPhotos] = useState<{ id: string, url: string, type: 'before' | 'after', created_at: string }[]>([]);
    const [anamnesisPhotos, setAnamnesisPhotos] = useState<{ id: string, url: string, created_at: string }[]>([]);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
    const [photoType, setPhotoType] = useState<'before' | 'after'>('before');

    // Product Sale State
    const [products, setProducts] = useState<Product[]>([]);
    const [paymentType, setPaymentType] = useState<'service' | 'product'>('service');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [saleQuantity, setSaleQuantity] = useState<number>(1);

    // New Payment Form States
    const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [newPaymentProcedure, setNewPaymentProcedure] = useState('');
    const [newPaymentAmount, setNewPaymentAmount] = useState<string>(''); // Valor Original
    const [discount, setDiscount] = useState<string>(''); // Desconto
    const [observation, setObservation] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Pix');
    const [isSplitPayment, setIsSplitPayment] = useState(false);
    const [paymentMethod2, setPaymentMethod2] = useState<string>('Dinheiro');
    const [amountMethod1, setAmountMethod1] = useState<string>('');
    const [amountMethod2, setAmountMethod2] = useState<string>('');

    const [tempReceipt, setTempReceipt] = useState<string | null>(null);

    useEffect(() => {
        if (patient.id) {
            fetchPatientData();
        }
    }, [patient.id]);

    const fetchPatientData = async () => {
        // Fetch Appointments
        const { data: aptData } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', patient.id)
            .order('date', { ascending: false });

        if (aptData) setAppointments(aptData as any[]);

        // Fetch Payments
        const { data: payData } = await supabase
            .from('patient_payments')
            .select('*')
            .eq('patient_id', patient.id)
            .order('date', { ascending: false });

        if (payData) {
            setPayments(payData.map((p: any) => ({
                id: p.id,
                date: p.date || new Date().toISOString(),
                procedure: p.procedure || 'Sem procedimento',
                amount: p.amount || 0,
                paymentMethod: p.payment_method,
                paymentMethod2: p.payment_method_2,
                amountMethod1: p.amount_method_1,
                amountMethod2: p.amount_method_2,
                discount: p.discount,
                observation: p.observation,
            })));
        }

        // Fetch Clinical Notes
        const { data: notesData } = await supabase
            .from('clinical_notes')
            .select('*')
            .eq('patient_id', patient.id)
            .order('date', { ascending: false });

        if (notesData) {
            const notes = notesData as any[];
            setClinicalNotes(notes.map(n => ({
                id: n.id,
                patientId: n.patient_id,
                content: n.content,
                date: n.date,
                createdAt: n.created_at
            })));
        }

        // Fetch Photos
        const { data: photoData } = await supabase
            .from('patient_photos')
            .select('*')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false });

        if (photoData) {
            const allPhotos = photoData as any[];
            setPhotos(allPhotos.filter(p => p.type === 'before' || p.type === 'after').map(p => ({
                id: p.id,
                url: p.url,
                type: p.type as 'before' | 'after',
                created_at: p.created_at
            })));
            setAnamnesisPhotos(allPhotos.filter(p => p.type === 'anamnesis').map(p => ({
                id: p.id,
                url: p.url,
                created_at: p.created_at
            })));
        }

        // Fetch Products for Sale
        const { data: prodData } = await supabase.from('products').select('*').gt('quantity', 0);
        if (prodData) {
            setProducts(prodData.map((p: any) => ({
                id: p.id,
                name: p.name,
                brand: p.brand || '',
                lotNumber: p.lot_number || '',
                expiryDate: p.expiry_date || '',
                costPrice: p.cost_price || 0,
                salePrice: p.sale_price || 0,
                supplier: p.supplier || '',
                quantity: p.quantity || 0
            })));
        }
    };

    // Clinical Notes Handlers
    const handleAddNote = async (content: string) => {
        const { data, error } = await supabase
            .from('clinical_notes')
            .insert({
                patient_id: patient.id,
                content
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error adding note:', error);
            alert('Erro ao salvar anotação.');
            return;
        }

        if (data) {
            const newNote: any = data;
            setClinicalNotes(prev => [{
                id: newNote.id,
                patientId: newNote.patient_id,
                content: newNote.content,
                date: newNote.date,
                createdAt: newNote.created_at
            }, ...prev]);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm('Deseja excluir esta anotação?')) return;

        const { error } = await supabase
            .from('clinical_notes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting note:', error);
            alert('Erro ao excluir anotação.');
            return;
        }

        setClinicalNotes(prev => prev.filter(n => n.id !== id));
    };

    // Photo Handler
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPendingPhoto(reader.result as string);
                setUploadModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnamnesisPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const url = reader.result as string;
                try {
                    const { data, error } = await supabase
                        .from('patient_photos')
                        .insert({
                            patient_id: patient.id,
                            url: url,
                            type: 'anamnesis'
                        } as any)
                        .select()
                        .single();

                    if (error) throw error;
                    if (!data) throw new Error('No data returned from upload');

                    const newData = data as any;
                    setAnamnesisPhotos(prev => [{
                        id: newData.id,
                        url: newData.url,
                        created_at: newData.created_at
                    }, ...prev]);

                } catch (err) {
                    console.error('Error saving anamnesis photo:', err);
                    alert('Erro ao salvar foto da ficha.');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmUpload = async () => {
        if (!pendingPhoto) return;

        try {
            const { data, error } = await supabase
                .from('patient_photos')
                .insert({
                    patient_id: patient.id,
                    url: pendingPhoto,
                    type: photoType
                } as any)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                const newData = data as any;
                setPhotos(prev => [{
                    id: newData.id,
                    url: newData.url,
                    type: newData.type as 'before' | 'after',
                    created_at: newData.created_at
                }, ...prev]);
            }
            setUploadModalOpen(false);
            setPendingPhoto(null);
        } catch (err) {
            console.error('Error uploading photo:', err);
            alert('Erro ao salvar foto.');
        }
    };

    const handleDeletePhoto = async (id: string, isAnamnesis = false) => {
        if (!confirm('Excluir esta foto?')) return;
        try {
            await supabase.from('patient_photos').delete().eq('id', id);
            if (isAnamnesis) {
                setAnamnesisPhotos(prev => prev.filter(p => p.id !== id));
            } else {
                setPhotos(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error('Error deleting photo:', err);
        }
    };

    // Payment Handlers
    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setTempReceipt(url);
            console.log('[Quality-Log] Comprovante de pagamento selecionado');
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const originalVal = Number(newPaymentAmount);
        const discountVal = Number(discount) || 0;
        const finalAmount = originalVal - discountVal;

        if (!originalVal) {
            alert('Informe o valor do pagamento.');
            return;
        }

        // Validation for product sale vs service
        let procedureName = newPaymentProcedure;

        if (paymentType === 'service') {
            if (!newPaymentProcedure) {
                alert('Informe o nome do procedimento.');
                return;
            }
        } else if (paymentType === 'product') {
            if (!selectedProductId) {
                alert('Selecione um produto.');
                return;
            }
            const prod = products.find(p => p.id === selectedProductId);
            if (prod) {
                procedureName = `Venda: ${prod.name} (${saleQuantity}un)`;
            } else {
                alert('Produto não encontrado.');
                return;
            }
        }

        // Validate Split Payment
        if (isSplitPayment) {
            const val1 = Number(amountMethod1);
            const val2 = Number(amountMethod2);
            if (val1 + val2 !== finalAmount) {
                alert(`A soma dos pagamentos (R$ ${(val1 + val2).toFixed(2)}) deve ser igual ao valor final (R$ ${finalAmount.toFixed(2)}).`);
                return;
            }
        }

        const paymentPayload = {
            patient_id: patient.id,
            date: newPaymentDate,
            procedure: procedureName,
            amount: finalAmount,
            payment_method: paymentMethod,
            payment_method_2: isSplitPayment ? paymentMethod2 : null,
            amount_method_1: isSplitPayment ? Number(amountMethod1) : finalAmount,
            amount_method_2: isSplitPayment ? Number(amountMethod2) : null,
            discount: discountVal,
            observation: observation,
            receipt_url: tempReceipt || null
        };

        try {
            // 1. Register Payment
            const { data, error } = await supabase
                .from('patient_payments')
                .insert(paymentPayload as any)
                .select()
                .single();

            if (error) throw error;

            // 2. Decrement Stock if it's a product sale
            if (paymentType === 'product' && selectedProductId) {
                const product = products.find(p => p.id === selectedProductId);
                if (product) {
                    const newQuantity = product.quantity - saleQuantity;
                    const { error: stockError } = await supabase
                        .from('products')
                        .update({ quantity: newQuantity })
                        .eq('id', selectedProductId);

                    if (!stockError) {
                        setProducts(prev => prev.map(p => p.id === selectedProductId ? { ...p, quantity: newQuantity } : p));
                    }
                }
            }

            if (data) {
                const newData = data as any;
                const paymentToAdd: PatientPayment = {
                    id: newData.id,
                    date: newData.date!,
                    procedure: newData.procedure!,
                    amount: newData.amount!,
                    paymentMethod: newData.payment_method,
                    paymentMethod2: newData.payment_method_2,
                    amountMethod1: newData.amount_method_1,
                    amountMethod2: newData.amount_method_2,
                    discount: newData.discount,
                    observation: newData.observation,
                    receiptUrl: newData.receipt_url || undefined
                };
                setPayments(prev => [paymentToAdd, ...prev]);
                console.log('[Quality-Log] Novo pagamento registrado:', paymentToAdd);
            }
        } catch (err) {
            console.error('Error saving payment:', err);
            alert('Erro ao salvar pagamento. Verifique se a migração do banco de dados foi aplicada.');
        }

        // Reset Form
        setNewPaymentProcedure('');
        setNewPaymentAmount('');
        setDiscount('');
        setObservation('');
        setTempReceipt(null);
        setSelectedProductId('');
        setSaleQuantity(1);
        setIsSplitPayment(false);
        setAmountMethod1('');
        setAmountMethod2('');
    };

    // Calculate final amount for display
    const calculateFinalAmount = () => {
        const original = Number(newPaymentAmount) || 0;
        const disc = Number(discount) || 0;
        return Math.max(0, original - disc);
    };

    return (
        <div className="glass-card rounded-2xl shadow-xl min-h-[600px] flex flex-col border border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-start bg-black/20">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-surface-highlight rounded-2xl flex items-center justify-center text-3xl font-serif font-bold text-gold-500 shadow-inner border border-white/5 overflow-hidden">
                        {patient.photoUrl ? <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" /> : patient.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-text-primary mb-1">{patient.name}</h2>
                        <p className="text-text-secondary flex items-center gap-2">
                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs">{patient.age} anos</span>
                            <span className="text-gold-500/50">•</span>
                            <span>{patient.phone}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wide shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">Ativo</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-8 overflow-x-auto bg-black/10 scrollbar-thin scrollbar-thumb-gold-500/10">
                {[
                    { id: 'info', icon: FileText, label: 'Info' },
                    { id: 'anamnesis', icon: Activity, label: 'Anamnese' },
                    { id: 'clinical_notes', icon: FileText, label: 'Evolução' },
                    { id: 'photos', icon: ImageIcon, label: 'Fotos' },
                    { id: 'payments', icon: DollarSign, label: 'Financeiro' }
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-6 py-5 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                                ${isActive
                                    ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
                                }
                            `}
                        >
                            <Icon size={18} className={isActive ? 'drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]' : ''} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <div className="p-8 flex-1">
                {activeTab === 'info' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider text-xs opacity-70 mb-4">Dados Cadastrais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-text-secondary">
                            <div className="p-5 bg-surface/50 rounded-xl border border-white/5 hover:border-gold-500/20 transition-colors group">
                                <span className="text-[10px] uppercase text-gold-500/70 font-bold block mb-2 tracking-widest">Nome Completo</span>
                                <span className="text-lg text-text-primary font-medium">{patient.name}</span>
                            </div>
                            <div className="p-5 bg-surface/50 rounded-xl border border-white/5 hover:border-gold-500/20 transition-colors w-fit min-w-[150px]">
                                <span className="text-[10px] uppercase text-gold-500/70 font-bold block mb-2 tracking-widest">Idade</span>
                                <span className="text-lg text-text-primary font-medium">{patient.age}</span>
                            </div>
                            <div className="p-5 bg-surface/50 rounded-xl border border-white/5 hover:border-gold-500/20 transition-colors">
                                <span className="text-[10px] uppercase text-gold-500/70 font-bold block mb-2 tracking-widest">Telefone</span>
                                <span className="text-lg text-text-primary font-medium font-mono">{patient.phone}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'anamnesis' && (
                    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
                        {/* Anamnesis Content - Same as before */}
                        <div className="space-y-5">
                            {anamnesisData.map(field => (
                                <div key={field.id} className="bg-surface/50 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <label className="block text-sm font-semibold text-text-primary mb-3">{field.label}</label>
                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            className="w-full p-3 border border-white/10 rounded-lg bg-black/20 text-text-primary placeholder-text-muted/50 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 outline-none transition-all"
                                            defaultValue={field.value as string}
                                        />
                                    )}
                                    {field.type === 'boolean' && (
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === true ? 'border-gold-500 bg-gold-500/20' : 'border-text-muted'}`}>
                                                    {field.value === true && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />}
                                                </div>
                                                <input type="radio" name={field.id} defaultChecked={field.value === true} className="hidden" />
                                                <span className={`text-sm ${field.value === true ? 'text-gold-400 font-bold' : 'text-text-secondary group-hover:text-text-primary'}`}>Sim</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${field.value === false ? 'border-gold-500 bg-gold-500/20' : 'border-text-muted'}`}>
                                                    {field.value === false && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full" />}
                                                </div>
                                                <input type="radio" name={field.id} defaultChecked={field.value === false} className="hidden" />
                                                <span className={`text-sm ${field.value === false ? 'text-gold-400 font-bold' : 'text-text-secondary group-hover:text-text-primary'}`}>Não</span>
                                            </label>
                                        </div>
                                    )}
                                    {field.type === 'select' && field.options && (
                                        <select className="w-full p-3 border border-white/10 rounded-lg bg-black/20 text-text-primary focus:border-gold-500/50 outline-none" defaultValue={field.value as string}>
                                            {field.options.map(opt => <option key={opt} className="bg-surface text-text-primary">{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Photos Section omitted for brevity but should be kept if replacing full file. 
                            Since I am overwriting the file, I must include EVERYTHING. Added back below. 
                        */}
                        <div className="mt-10 border-t border-white/10 pt-8">
                            <label className="block text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Ficha Física Digitalizada</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {anamnesisPhotos.map(photo => (
                                    <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[3/4] bg-surface-highlight">
                                        <img src={photo.url} alt="Ficha" className="w-full h-full object-cover" onClick={() => setViewingPhotoUrl(photo.url)} />
                                        <button onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id, true); }} className="absolute top-2 right-2 p-2 bg-black/50 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {anamnesisPhotos.length < 3 && (
                                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-xl aspect-[3/4] cursor-pointer hover:bg-white/5 hover:border-gold-500/30 transition-all text-text-muted">
                                        <Camera size={24} />
                                        <span className="text-xs font-bold">Adicionar Foto</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAnamnesisPhotoSelect} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'clinical_notes' && (
                    <ClinicalNotes notes={clinicalNotes} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
                )}

                {activeTab === 'photos' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Simple Photos Gallery Implementation */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-serif font-bold text-gold-100">Galeria Antes & Depois</h3>
                            <label className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 rounded-xl cursor-pointer hover:brightness-110 shadow-lg shadow-gold-500/20 font-bold text-sm">
                                <Camera size={18} />
                                <span>Nova Foto</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {photos.map(photo => (
                                <div key={photo.id} className="relative group rounded-2xl overflow-hidden shadow-2xl aspect-square bg-surface border border-white/5 hover:border-gold-500/30">
                                    <img src={photo.url} alt={photo.type} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setViewingPhotoUrl(photo.url)} />
                                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold uppercase text-white border border-white/10">
                                        {photo.type === 'before' ? 'Antes' : 'Depois'}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }} className="absolute top-2 right-2 p-2 bg-black/40 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Upload Modal */}
                        {uploadModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                                <div className="glass-card rounded-2xl max-w-lg w-full p-6 space-y-4">
                                    <h3 className="font-bold text-lg text-white">Salvar Foto</h3>
                                    <div className="aspect-square bg-black/50 rounded-xl overflow-hidden"><img src={pendingPhoto!} className="w-full h-full object-contain" /></div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setPhotoType('before')} className={`flex-1 p-3 rounded-lg border ${photoType === 'before' ? 'border-primary text-primary' : 'border-white/10 text-white'}`}>Antes</button>
                                        <button onClick={() => setPhotoType('after')} className={`flex-1 p-3 rounded-lg border ${photoType === 'after' ? 'border-primary text-primary' : 'border-white/10 text-white'}`}>Depois</button>
                                    </div>
                                    <button onClick={confirmUpload} className="w-full bg-primary py-3 rounded-lg text-white font-bold">Salvar</button>
                                    <button onClick={() => setUploadModalOpen(false)} className="w-full py-2 text-white/50">Cancelar</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in duration-300">
                        {/* Left Column: History & Appointments */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Payment History Table with new columns */}
                            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                                <div className="p-4 border-b border-white/5 bg-white/5 min-w-[600px]">
                                    <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider">Pagamentos Realizados</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[700px]">
                                        <thead className="bg-black/20 border-b border-white/5">
                                            <tr>
                                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Data</th>
                                                <th className="p-4 text-xs font-bold text-text-secondary uppercase">Procedimento</th>
                                                <th className="p-4 text-xs font-bold text-text-secondary uppercase text-right">Valor</th>
                                                <th className="p-4 text-xs font-bold text-text-secondary uppercase text-center">Forma</th>
                                                <th className="p-4 text-xs font-bold text-text-secondary uppercase text-center">Comp.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {payments.map(pay => (
                                                <tr key={pay.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4 text-sm text-text-secondary font-mono opacity-80">{new Date(pay.date).toLocaleDateString()}</td>
                                                    <td className="p-4 text-sm font-medium text-text-primary">
                                                        {pay.procedure}
                                                        {pay.discount && pay.discount > 0 && <span className="block text-[10px] text-green-400">Desc: R$ {pay.discount}</span>}
                                                        {pay.observation && <span className="block text-[10px] text-text-muted italic max-w-[200px] truncate">{pay.observation}</span>}
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-emerald-400 font-mono text-right">R$ {pay.amount.toFixed(2)}</td>
                                                    <td className="p-4 text-xs text-text-secondary text-center">
                                                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{pay.paymentMethod || '-'}</span>
                                                        {pay.paymentMethod2 && (
                                                            <div className="mt-1 flex justify-center gap-1">
                                                                <span className="text-[10px]">+ {pay.paymentMethod2}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {pay.receiptUrl ? <FileText size={16} className="text-gold-400 inline" /> : <span className="text-text-muted/30">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: NEW Payment Form */}
                        <div className="bg-surface/40 p-6 rounded-2xl border border-gold-500/20 shadow-lg shadow-black/20 h-fit backdrop-blur-sm">
                            <h4 className="text-lg font-bold text-gold-100 mb-6 flex items-center gap-2">
                                <CreditCard className="text-gold-500" />
                                Novo Pagamento
                            </h4>

                            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="label-text">Data</label>
                                        <input type="date" required value={newPaymentDate} onChange={(e) => setNewPaymentDate(e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label-text">Tipo</label>
                                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                                            <button type="button" onClick={() => setPaymentType('service')} className={`flex-1 py-1.5 text-xs font-bold rounded ${paymentType === 'service' ? 'bg-gold-500 text-black' : 'text-text-muted'}`}>Serviço</button>
                                            <button type="button" onClick={() => setPaymentType('product')} className={`flex-1 py-1.5 text-xs font-bold rounded ${paymentType === 'product' ? 'bg-gold-500 text-black' : 'text-text-muted'}`}>Produto</button>
                                        </div>
                                    </div>
                                </div>

                                {paymentType === 'product' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="label-text block mb-2">Produto:</label>
                                            <select className="input-field" value={selectedProductId} onChange={(e) => {
                                                const pid = e.target.value;
                                                setSelectedProductId(pid);
                                                const prod = products.find(p => p.id === pid);
                                                if (prod) setNewPaymentAmount((prod.salePrice * saleQuantity).toFixed(2));
                                            }}>
                                                <option value="" className="bg-surface text-text-primary">Selecione...</option>
                                                {products.map(p => <option key={p.id} value={p.id} className="bg-surface text-text-primary">{p.name} (R$ {p.salePrice}) - Est: {p.quantity}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text block mb-2">Quantidade:</label>
                                            <input type="number" min="1" max={products.find(p => p.id === selectedProductId)?.quantity || 1} value={saleQuantity} onChange={(e) => {
                                                const qty = Number(e.target.value);
                                                setSaleQuantity(qty);
                                                const prod = products.find(p => p.id === selectedProductId);
                                                if (prod) setNewPaymentAmount((prod.salePrice * qty).toFixed(2));
                                            }} className="input-field" />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label-text">Procedimento</label>
                                        <input type="text" placeholder="Ex: Botox" value={newPaymentProcedure} onChange={(e) => setNewPaymentProcedure(e.target.value)} className="input-field" />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="label-text">Valor (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={newPaymentAmount}
                                            onChange={(e) => setNewPaymentAmount(e.target.value)}
                                            className={`input-field font-mono ${paymentType === 'product' ? 'opacity-70 cursor-not-allowed bg-black/40' : ''}`}
                                            readOnly={paymentType === 'product'}
                                        />
                                    </div>
                                    <div>
                                        <label className="label-text">Desconto (R$)</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field font-mono text-green-400" />
                                    </div>
                                </div>

                                <div className="p-4 bg-black/30 rounded-lg border border-white/5 my-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-text-secondary uppercase">Total a Pagar</span>
                                        <span className="text-xl font-bold text-gold-500 font-mono">R$ {calculateFinalAmount().toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Methods Section */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={isSplitPayment} onChange={(e) => setIsSplitPayment(e.target.checked)} className="accent-gold-500 w-4 h-4" />
                                        <span className="text-sm text-text-secondary flex items-center gap-2"><Split size={14} /> Mais de uma forma de pagamento</span>
                                    </label>

                                    {!isSplitPayment ? (
                                        <div>
                                            <label className="label-text">Forma de Pagamento</label>
                                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
                                                <option className="bg-surface text-text-primary">Pix</option>
                                                <option className="bg-surface text-text-primary">Cartão de Crédito</option>
                                                <option className="bg-surface text-text-primary">Cartão de Débito</option>
                                                <option className="bg-surface text-text-primary">Dinheiro</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-text text-[10px]">Forma 1</label>
                                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field text-xs py-2">
                                                        <option className="bg-surface text-text-primary">Pix</option>
                                                        <option className="bg-surface text-text-primary">Crédito</option>
                                                        <option className="bg-surface text-text-primary">Débito</option>
                                                        <option className="bg-surface text-text-primary">Dinheiro</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label-text text-[10px]">Valor 1 (R$)</label>
                                                    <input type="number" step="0.01" value={amountMethod1} onChange={(e) => setAmountMethod1(e.target.value)} className="input-field text-xs py-2 font-mono" placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-text text-[10px]">Forma 2</label>
                                                    <select value={paymentMethod2} onChange={(e) => setPaymentMethod2(e.target.value)} className="input-field text-xs py-2">
                                                        <option className="bg-surface text-text-primary">Pix</option>
                                                        <option className="bg-surface text-text-primary">Crédito</option>
                                                        <option className="bg-surface text-text-primary">Débito</option>
                                                        <option className="bg-surface text-text-primary">Dinheiro</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label-text text-[10px]">Valor 2 (R$)</label>
                                                    <input type="number" step="0.01" value={amountMethod2} onChange={(e) => setAmountMethod2(e.target.value)} className="input-field text-xs py-2 font-mono" placeholder="0.00" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label className="label-text">Observação</label>
                                    <textarea rows={3} value={observation} onChange={(e) => setObservation(e.target.value)} className="input-field resize-none" placeholder="Detalhes adicionais..." />
                                </div>

                                <div>
                                    <label className="label-text mb-2 flex items-center justify-between">
                                        <span>Comprovante</span>
                                        {tempReceipt && <span className="text-emerald-400 text-[10px] flex items-center gap-1"><CheckCircle size={10} /> Anexado</span>}
                                    </label>
                                    <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 hover:border-gold-500/30 transition-all group">
                                        <Upload size={16} className="text-text-muted group-hover:text-gold-400 transition-colors" />
                                        <span className="text-xs text-text-secondary group-hover:text-text-primary">Anexar Arquivo/Foto</span>
                                        <input type="file" onChange={handleReceiptUpload} className="hidden" accept="image/*,application/pdf" />
                                    </label>
                                </div>

                                <button type="submit" className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 uppercase tracking-wide text-xs">
                                    Registrar Pagamento
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {viewingPhotoUrl && (
                <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={() => setViewingPhotoUrl(null)}>
                    <button className="absolute top-6 right-6 text-white" onClick={() => setViewingPhotoUrl(null)}><X size={24} /></button>
                    <img src={viewingPhotoUrl} className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            <style>{`
                .label-text { @apply block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 ml-1; }
                .input-field { @apply w-full p-3 border border-white/10 rounded-xl bg-black/20 text-text-primary focus:ring-1 focus:ring-gold-500/50 outline-none text-sm transition-all; }
            `}</style>
        </div>
    );
};