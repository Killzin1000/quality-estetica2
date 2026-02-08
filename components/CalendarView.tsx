import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Settings, ExternalLink, Save, Info } from 'lucide-react';

export const CalendarView: React.FC = () => {
    // Try to load from localStorage, default to empty
    const [calendarId, setCalendarId] = useState(() => {
        return localStorage.getItem('google_calendar_id') || '';
    });

    // Default to 'tech.qualityestetica@gmail.com' or a public holiday calendar as demo if empty? 
    // Better to show setup instructions if empty.

    const [isConfiguring, setIsConfiguring] = useState(!calendarId);
    const [tempId, setTempId] = useState(calendarId);

    const handleSave = () => {
        const cleanId = tempId.trim();
        if (cleanId) {
            localStorage.setItem('google_calendar_id', cleanId);
            setCalendarId(cleanId);
            setIsConfiguring(false);
        }
    };

    // Construct the embed URL
    // We use a dark background style if possible, but Google generic embed is light.
    // We can use the 'bgcolor' parameter but it only affects the frame border, not the content.
    const embedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America%2FSao_Paulo&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`;

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gold-400 flex items-center gap-3">
                        <CalendarIcon className="text-gold-500" />
                        Agenda Google
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">
                        Visualize seus agendamentos diretamente no sistema.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsConfiguring(!isConfiguring)}
                        className={`p-2 rounded-lg border transition-all ${isConfiguring ? 'bg-gold-500/20 border-gold-500/50 text-gold-400' : 'bg-surface border-white/10 text-text-muted hover:text-white'}`}
                        title="Configurar Agenda"
                    >
                        <Settings size={20} />
                    </button>
                    {calendarId && (
                        <a
                            href="https://calendar.google.com/calendar/"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-black/40 border border-white/10 text-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            Abir no Google <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>

            {/* Configuration Panel */}
            {isConfiguring && (
                <div className="bg-surface/50 border border-gold-500/30 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-gold-500" />
                        Configuração da Agenda
                    </h3>

                    <div className="flex flex-col gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-200 text-sm">
                            <Info className="shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="font-bold mb-1">Como encontrar o ID da sua Agenda:</p>
                                <ol className="list-decimal pl-4 space-y-1 opacity-90">
                                    <li>Abra o Google Agenda no computador.</li>
                                    <li>Vá em <strong>Configurações</strong> {'>'} Selecione a agenda na esquerda.</li>
                                    <li>Role até a seção <strong>"Integrar agenda"</strong>.</li>
                                    <li>Copie o <strong>"ID da agenda"</strong> (geralmente é seu email).</li>
                                    <li>Cole abaixo.</li>
                                </ol>
                                <p className="mt-2 text-xs opacity-70">
                                    Nota: A agenda precisa estar como "Pública" ou você deve estar logado no navegador com a conta que tem acesso a ela.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={tempId}
                                onChange={(e) => setTempId(e.target.value)}
                                placeholder="Ex: quality.estetica@gmail.com ou ID longo..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-text-primary focus:border-gold-500/50 outline-none transition-colors placeholder-text-muted/50"
                            />
                            <button
                                onClick={handleSave}
                                disabled={!tempId.trim()}
                                className="bg-gold-500 text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Embed */}
            <div className="flex-1 bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative min-h-[500px]">
                {calendarId ? (
                    <iframe
                        src={embedUrl}
                        style={{ border: 0 }}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        className="w-full h-full bg-white" // iframe usually has white bg, we can try to filter it
                        title="Google Calendar"
                    ></iframe>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-surface-highlight/20 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <CalendarIcon size={40} className="text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Agenda não configurada</h3>
                        <p className="text-text-secondary max-w-md mx-auto">
                            Clique no ícone de engrenagem acima para configurar o ID da sua Google Agenda e visualizá-la aqui.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
