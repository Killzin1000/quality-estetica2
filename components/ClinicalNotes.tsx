import React, { useState } from 'react';
import { ClinicalNote } from '../types';
import { Send, FileText, Clock, Trash2, Mic, Square, Loader } from 'lucide-react';

interface ClinicalNotesProps {
    notes: ClinicalNote[];
    onAddNote: (note: string) => void;
    onDeleteNote: (id: string) => void;
}

export const ClinicalNotes: React.FC<ClinicalNotesProps> = ({ notes, onAddNote, onDeleteNote }) => {
    const [newNote, setNewNote] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = React.useRef<any>(null);

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome ou Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Append final result to current text
            if (finalTranscript) {
                setNewNote(prev => prev + finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsRecording(false);
        };

        recognition.start();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        onAddNote(newNote);
        setNewNote('');
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Input Section */}
            <div className={`bg-surface/50 p-6 rounded-2xl border shadow-xl backdrop-blur-sm relative overflow-hidden transition-all duration-300 ${isRecording ? 'border-red-500/30' : 'border-white/5'}`}>
                {isRecording && <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]" />}

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gold-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <FileText size={16} />
                        Nova Evolução
                    </h3>
                    {isRecording && (
                        <div className="flex items-center gap-2 text-red-400 animate-pulse">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold tracking-wider">GRAVANDO...</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder={isRecording ? "Ouvindo... (Pode falar)" : "Descreva o procedimento realizado, utilize o microfone para ditar..."}
                        className={`w-full bg-black/40 border rounded-xl p-4 text-sm text-text-primary placeholder-text-muted/50 outline-none resize-none h-32 transition-all scrollbar-thin scrollbar-thumb-white/10 ${isRecording ? 'border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : 'border-white/10 focus:border-gold-500/50'}`}
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-lg backdrop-blur-md border border-white/10 ${isRecording ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-black/60 text-text-secondary hover:text-white hover:bg-white/5'}`}
                            title={isRecording ? "Parar Gravação" : "Iniciar Ditado"}
                        >
                            {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
                            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">{isRecording ? 'Parar' : 'Ditar'}</span>
                        </button>

                        <button
                            type="submit"
                            disabled={!newNote.trim()}
                            className="bg-gold-500 text-black p-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-500/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Timeline Section */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-4">
                <h3 className="text-text-secondary font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2 px-2">
                    <Clock size={16} />
                    Histórico Clínico
                </h3>

                {notes.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-surface/30">
                        <FileText size={32} className="mx-auto text-text-muted mb-3 opacity-50" />
                        <p className="text-text-muted text-sm italic">Nenhuma anotação registrada.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.map((note) => (
                            <div key={note.id} className="group relative bg-surface/30 p-5 rounded-2xl border border-white/5 hover:border-gold-500/30 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-gold-500/80 bg-gold-500/5 px-2 py-1 rounded border border-gold-500/10">
                                        {new Date(note.date).toLocaleString('pt-BR')}
                                    </span>
                                    <button
                                        onClick={() => onDeleteNote(note.id)}
                                        className="text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                        title="Excluir anotação"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                                    {note.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
