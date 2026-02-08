import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { UserProfile, UserPermission } from '../types';
import { Shield, Check, X, User, Edit, Save, Lock } from 'lucide-react';

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as UserProfile[]);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: UserProfile) => {
        setEditingId(user.id);
        setEditForm({ ...user });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async () => {
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: editForm.role,
                    status: editForm.status,
                    permissions: editForm.permissions
                })
                .eq('id', editingId);

            if (error) throw error;

            setEditingId(null);
            fetchUsers();
            alert('Usuário atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Erro ao atualizar usuário.');
        }
    };

    const togglePermission = (perm: UserPermission) => {
        const currentPerms = editForm.permissions || [];
        if (currentPerms.includes(perm)) {
            setEditForm({ ...editForm, permissions: currentPerms.filter(p => p !== perm) });
        } else {
            setEditForm({ ...editForm, permissions: [...currentPerms, perm] });
        }
    };

    const allPermissions: { id: UserPermission, label: string }[] = [
        { id: 'financial', label: 'Financeiro' },
        { id: 'stock', label: 'Estoque' },
        { id: 'patients', label: 'Pacientes' },
        { id: 'calendar', label: 'Agenda' },
        { id: 'skin-analysis', label: 'Skin Analysis' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Shield size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-serif font-bold text-text-primary">Gestão de Usuários</h2>
                    <p className="text-text-secondary text-sm">Gerencie acessos e permissões do sistema.</p>
                </div>
            </header>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-highlight/50 border-b border-white/10">
                            <tr>
                                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Usuário</th>
                                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Função</th>
                                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Permissões</th>
                                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-gold-400 font-bold border border-white/10">
                                                {user.full_name?.charAt(0) || <User size={18} />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-text-primary">{user.full_name || 'Sem nome'}</div>
                                                <div className="text-xs text-text-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {editingId === user.id ? (
                                            <select
                                                value={editForm.status}
                                                onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-text-primary outline-none focus:border-gold-500/50"
                                            >
                                                <option value="active">Ativo</option>
                                                <option value="pending">Pendente</option>
                                                <option value="blocked">Bloqueado</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : user.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Bloqueado'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        {editingId === user.id ? (
                                            <select
                                                value={editForm.role}
                                                onChange={e => setEditForm({ ...editForm, role: e.target.value as any })}
                                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-text-primary outline-none focus:border-gold-500/50"
                                            >
                                                <option value="collaborator">Colaborador</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' && <Shield size={14} className="text-indigo-400" />}
                                                <span className="text-sm text-text-secondary capitalize">{user.role === 'admin' ? 'Administrador' : 'Colaborador'}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 max-w-xs">
                                        {editingId === user.id ? (
                                            <div className="flex flex-wrap gap-2">
                                                {allPermissions.map(perm => (
                                                    <button
                                                        key={perm.id}
                                                        onClick={() => togglePermission(perm.id)}
                                                        className={`px-2 py-1 rounded text-xs border transition-colors ${editForm.permissions?.includes(perm.id) ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-surface border-white/10 text-text-muted hover:border-white/30'}`}
                                                    >
                                                        {perm.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {user.role === 'admin' ? (
                                                    <span className="text-xs text-indigo-400 font-medium">Acesso Total</span>
                                                ) : user.permissions?.length ? (
                                                    user.permissions.map(p => (
                                                        <span key={p} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-text-secondary">
                                                            {allPermissions.find(ap => ap.id === p)?.label || p}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-text-muted italic">Nenhuma permissão</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        {editingId === user.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={handleSave} className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors" title="Salvar">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={handleCancel} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors" title="Cancelar">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEdit(user)} className="p-2 text-text-muted hover:text-gold-400 hover:bg-white/5 rounded transition-colors" title="Editar">
                                                <Edit size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
