import React, { useState, useRef } from 'react';
import { BodyMarker } from '../types';
import { X, MapPin, MousePointerClick } from 'lucide-react';

interface BodyMapProps {
  markers: BodyMarker[];
  onAddMarker: (marker: BodyMarker) => void;
  onRemoveMarker: (id: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({ markers, onAddMarker, onRemoveMarker }) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [tempMarker, setTempMarker] = useState<{ x: number, y: number } | null>(null);
  const [note, setNote] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tempMarker) return; // Prevent clicking while adding a note

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      // Calculate coordinates relative to the SVG viewBox (200x500)
      const x = (e.clientX - rect.left) * (200 / rect.width);
      const y = (e.clientY - rect.top) * (500 / rect.height);

      setTempMarker({ x, y });
    }
  };

  const confirmMarker = () => {
    if (tempMarker && note) {
      const newMarker: BodyMarker = {
        id: crypto.randomUUID(),
        x: tempMarker.x,
        y: tempMarker.y,
        note,
        side: view
      };

      console.log('[Quality-Log] Marcador adicionado ao mapa corporal:', newMarker);
      onAddMarker(newMarker);
      setTempMarker(null);
      setNote('');
    }
  };

  const filteredMarkers = markers.filter(m => m.side === view);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Controls */}
      <div className="w-full md:w-72 flex flex-col gap-6">
        <div className="bg-surface/50 p-1.5 rounded-xl border border-white/5 flex gap-1">
          <button
            onClick={() => setView('front')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all uppercase tracking-wider ${view === 'front' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
          >
            Frente
          </button>
          <button
            onClick={() => setView('back')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all uppercase tracking-wider ${view === 'back' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
          >
            Costas
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl flex gap-3 items-start">
          <div className="mt-1 text-blue-400">
            <MousePointerClick size={20} />
          </div>
          <div>
            <p className="font-bold text-blue-200 text-sm mb-1">Instrução</p>
            <p className="text-xs text-blue-200/70 leading-relaxed">Clique na silhueta ao lado para adicionar um ponto de procedimento exato.</p>
          </div>
        </div>

        {/* List of points */}
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
          <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-gold-500" />
            Pontos ({view})
          </h3>

          {filteredMarkers.length === 0 && (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-surface/30">
              <p className="text-text-muted text-sm italic">Nenhum ponto marcado.</p>
            </div>
          )}

          {filteredMarkers.map(marker => (
            <div key={marker.id} className="glass-card p-4 rounded-xl border border-white/5 hover:border-gold-500/30 flex justify-between items-start group transition-all">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 mt-0.5 border border-gold-500/20">
                  <MapPin size={12} />
                </div>
                <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors leading-tight">{marker.note}</p>
              </div>
              <button
                onClick={() => onRemoveMarker(marker.id)}
                className="text-text-muted hover:text-red-400 transition-colors p-1 hover:bg-white/5 rounded"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="flex-1 bg-surface/30 border border-white/5 rounded-2xl p-4 flex justify-center relative overflow-hidden h-[500px] shadow-inner">
        {/* Background Grid/Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none"></div>

        <svg
          ref={svgRef}
          viewBox="0 0 200 500"
          className="h-full w-auto max-w-full cursor-crosshair drop-shadow-2xl relative z-10"
          onClick={handleSvgClick}
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
        >
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#333', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#222', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#333', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Silhouette Path */}
          <path
            d={view === 'front'
              ? "M100,20 C85,20 75,35 75,50 C75,65 80,75 80,75 C70,80 50,85 45,110 L40,200 L55,200 C55,200 55,250 60,250 C60,250 60,350 65,350 L75,480 L95,480 L98,380 L102,380 L105,480 L125,480 L135,350 C140,350 140,250 140,250 C145,250 145,200 145,200 L160,200 L155,110 C150,85 130,80 120,75 C120,75 125,65 125,50 C125,35 115,20 100,20 Z"
              : "M100,20 C85,20 75,35 75,50 C75,65 80,75 80,75 C65,80 50,85 45,110 L40,200 L55,200 C55,200 55,250 60,250 C60,250 60,350 65,350 L75,480 L95,480 L98,380 L102,380 L105,480 L125,480 L135,350 C140,350 140,250 140,250 C145,250 145,200 145,200 L160,200 L155,110 C150,85 135,80 120,75 C120,75 125,65 125,50 C125,35 115,20 100,20 Z"
            }
            fill="url(#bodyGradient)"
            stroke="#444"
            strokeWidth="1"
            className="transition-all duration-500 hover:stroke-gold-500/30"
          />

          {/* Render Existing Markers */}
          {filteredMarkers.map(marker => (
            <g key={marker.id} className="cursor-pointer group">
              <circle
                cx={marker.x}
                cy={marker.y}
                r="3"
                className="fill-gold-500 stroke-black stroke-[0.5] transition-all duration-300 group-hover:r-5 group-hover:shadow-glow"
                filter="url(#glow)"
                onClick={(e) => { e.stopPropagation(); /* Optional: handle click to edit */ }}
              />
              <title>{marker.note}</title> {/* Native Browser Tooltip for accessibility */}

              {/* SVG Tooltip */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={marker.x > 150 ? marker.x - 110 : marker.x + 10}
                  y={marker.y - 15}
                  width="100"
                  height="30"
                  rx="4"
                  fill="rgba(0,0,0,0.8)"
                  stroke="rgba(212,175,55,0.3)"
                />
                <text
                  x={marker.x > 150 ? marker.x - 60 : marker.x + 60}
                  y={marker.y + 5}
                  fill="#D4AF37"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {marker.note.length > 15 ? marker.note.substring(0, 15) + '...' : marker.note}
                </text>
              </g>
            </g>
          ))}

          {/* Render Temp Marker */}
          {tempMarker && (
            <circle
              cx={tempMarker.x}
              cy={tempMarker.y}
              r="4"
              className="fill-red-500 stroke-white stroke-1 animate-pulse"
            />
          )}
        </svg>

        {/* Input Popover for Note */}
        {tempMarker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setTempMarker(null)}
              onTouchEnd={() => setTempMarker(null)}
            />

            {/* Modal Content */}
            <div
              className="relative w-full max-w-sm bg-surface p-6 rounded-2xl shadow-2xl border border-gold-500/30 animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gold-400 uppercase tracking-widest">Adicionar Nota</span>
                <button
                  type="button"
                  onClick={() => setTempMarker(null)}
                  className="text-text-muted hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <textarea
                autoFocus
                className="w-full text-base border border-white/10 rounded-xl p-4 mb-4 outline-none focus:border-gold-500/50 bg-black/50 text-white placeholder-text-muted/50 resize-none min-h-[100px]"
                rows={3}
                placeholder="Ex: 5ml preenchedor..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <button
                type="button"
                onClick={confirmMarker}
                onTouchEnd={(e) => {
                  // Prevent ghost clicks but ensure action fires
                  e.preventDefault();
                  confirmMarker();
                }}
                disabled={!note}
                className="w-full bg-gold-500 text-black text-sm py-4 rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-lg shadow-gold-500/20 active:scale-95 touch-manipulation"
              >
                Salvar Ponto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};