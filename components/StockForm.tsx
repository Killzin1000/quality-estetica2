import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Plus, AlertTriangle, Save, Trash2, Search, Edit, Loader2 } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface StockFormProps { }

export const StockForm: React.FC<StockFormProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    lotNumber: '',
    expiryDate: '',
    costPrice: 0,
    salePrice: 0,
    supplier: '',
    quantity: 0
  });

  const [margin, setMargin] = useState<{ profit: number; percentage: number }>({ profit: 0, percentage: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        setProducts(data.map((p: any) => ({
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
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profit margin automatically
  useEffect(() => {
    if (newProduct.costPrice !== undefined && newProduct.salePrice !== undefined) {
      const cost = Number(newProduct.costPrice);
      const sale = Number(newProduct.salePrice);
      const profit = sale - cost;
      const percentage = cost > 0 ? (profit / cost) * 100 : 0;

      setMargin({ profit, percentage });
    }
  }, [newProduct.costPrice, newProduct.salePrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.lotNumber) return;

    try {
      const productPayload = {
        name: newProduct.name,
        brand: newProduct.brand,
        lot_number: newProduct.lotNumber,
        expiry_date: newProduct.expiryDate,
        cost_price: Number(newProduct.costPrice),
        sale_price: Number(newProduct.salePrice),
        supplier: newProduct.supplier,
        quantity: Number(newProduct.quantity)
      };

      if (editingId) {
        // UPDATE Existing Product
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingId);

        if (error) throw error;

        // Update local state
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...newProduct, id: editingId } as Product : p));
        alert('Produto atualizado com sucesso!');

      } else {
        // INSERT New Product
        const { data, error } = await supabase
          .from('products')
          .insert(productPayload)
          .select()
          .single();

        if (error) throw error;

        const savedProduct: Product = {
          id: data.id,
          name: data.name,
          brand: data.brand,
          lotNumber: data.lot_number,
          expiryDate: data.expiry_date,
          costPrice: data.cost_price,
          salePrice: data.sale_price,
          supplier: data.supplier,
          quantity: data.quantity
        };

        setProducts(prev => [savedProduct, ...prev]);
        alert('Produto cadastrado com sucesso!');
      }

      // Reset form (and editing mode)
      setNewProduct({
        name: '',
        brand: '',
        lotNumber: '',
        expiryDate: '',
        costPrice: 0,
        salePrice: 0,
        supplier: '',
        quantity: 0
      });
      setEditingId(null);

    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));

      // If deleting the item currently being edited, reset form
      if (editingId === id) {
        setEditingId(null);
        setNewProduct({
          name: '',
          brand: '',
          lotNumber: '',
          expiryDate: '',
          costPrice: 0,
          salePrice: 0,
          supplier: '',
          quantity: 0
        });
      }

    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao remover produto.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct({
      name: product.name,
      brand: product.brand,
      lotNumber: product.lotNumber,
      expiryDate: product.expiryDate,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      supplier: product.supplier,
      quantity: product.quantity
    });
    setEditingId(product.id);

    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewProduct({
      name: '',
      brand: '',
      lotNumber: '',
      expiryDate: '',
      costPrice: 0,
      salePrice: 0,
      supplier: '',
      quantity: 0
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <h2 className="text-2xl font-serif font-bold text-text-primary mb-8 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center text-gold-400">
            <Plus size={20} />
          </div>
          {editingId ? 'Editar Produto' : 'Entrada de Estoque'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Nome do Produto *</label>
            <input
              type="text"
              name="name"
              required
              value={newProduct.name}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
              placeholder="Ex: Toxina Botulínica"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Marca</label>
            <input
              type="text"
              name="brand"
              value={newProduct.brand}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
              placeholder="Ex: Botox"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Fornecedor</label>
            <input
              type="text"
              name="supplier"
              value={newProduct.supplier}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Lote *</label>
            <input
              type="text"
              name="lotNumber"
              required
              value={newProduct.lotNumber}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50 font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Validade *</label>
            <input
              type="date"
              name="expiryDate"
              required
              value={newProduct.expiryDate}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50 [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Quantidade</label>
            <input
              type="number"
              name="quantity"
              required
              min="0"
              value={newProduct.quantity}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Preço de Custo (R$)</label>
            <input
              type="number"
              name="costPrice"
              step="0.01"
              value={newProduct.costPrice}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">Preço de Venda (R$)</label>
            <input
              type="number"
              name="salePrice"
              step="0.01"
              value={newProduct.salePrice}
              onChange={handleInputChange}
              className="w-full p-3.5 bg-surface/50 border border-white/10 rounded-xl focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-text-primary placeholder-text-muted/50"
            />
          </div>

          <div className="lg:col-span-3 bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 mt-2">
            <div className="flex gap-8">
              <div>
                <span className="text-xs text-text-secondary uppercase tracking-widest block mb-1">Lucro Estimado</span>
                <span className={`text-xl font-bold font-serif ${margin.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R$ {margin.profit.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-xs text-text-secondary uppercase tracking-widest block mb-1">Margem (%)</span>
                <span className={`text-xl font-bold font-serif ${margin.percentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {margin.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-transparent border border-white/10 text-text-secondary font-medium rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-gold-950 font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 flex-1 sm:flex-none uppercase tracking-wide text-sm"
              >
                <Save size={18} />
                {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-highlight border-b border-white/10">
              <tr>
                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Produto</th>
                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Lote</th>
                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Validade</th>
                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Qtd</th>
                <th className="p-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-muted">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Carregando estoque...</span>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Search size={32} className="opacity-20" />
                        <span>Nenhum produto cadastrado.</span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isExpired = new Date(product.expiryDate) < new Date();
                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5">
                        <div className="font-medium text-text-primary text-base">{product.name}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{product.brand}</div>
                      </td>
                      <td className="p-5 text-text-secondary font-mono text-sm">{product.lotNumber}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {new Date(product.expiryDate).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-5 text-center font-bold text-text-primary">{product.quantity}</td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-text-secondary hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};