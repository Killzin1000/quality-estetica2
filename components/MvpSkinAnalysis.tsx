import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Camera, Upload, Sparkles, AlertCircle, Check, Loader } from 'lucide-react';

// NOTE: In a production app, this should be in an environment variable.
// Using the provided key for this prototype session.
const API_KEY = 'AIzaSyC0-KlWEy6l4dJ0Nc9_-dcUfybleUH07yA';

export const MvpSkinAnalysis: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setAnalysis('');
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeSkin = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            // Initialize Gemini
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Convert base64 to GoogleGenerativeAI format
            const base64Data = image.split(',')[1];

            const prompt = `
        Atue como um dermatologista estético especialista de alto nível.
        Analise esta imagem do rosto de um paciente e forneça uma avaliação detalhada para fins estéticos.
         Identifique e descreva:
        1. Qualidade da pele (hidratação, textura, poros).
        2. Sinais de envelhecimento (rugas dinâmicas/estáticas, sulcos).
        3. Pigmentação (manchas, melasma, uniformidade).
        4. Sugestões de tratamentos estéticos minimamente invasivos recomendados (ex: toxina botulínica, preenchedores, bioestimuladores, lasers).
        
        Seja profissional, empático e persuasivo, focando em como melhorar a autoestima do paciente.
        Formate a resposta com marcadores claros e divs HTML simples se possível, ou apenas texto bem estruturado.
        IMPORTANTE: Se a imagem não for de um rosto humano, responda apenas: "Por favor, envie uma foto clara de um rosto."
      `;

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg", // Assuming JPEG/PNG from input
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            setAnalysis(text);
        } catch (err: any) {
            console.error("Gemini Error:", err);
            setError(`Erro na análise: ${err.message || 'Falha ao conectar com a IA.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-gold-400 flex items-center gap-3">
                        <Sparkles className="text-gold-500" />
                        Smart Skin Analysis <span className="text-xs bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded border border-gold-500/30 uppercase tracking-widest font-sans">Beta AI</span>
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">Análise facial avançada </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-hidden">
                {/* Left Column: Image Input */}
                <div className="flex flex-col gap-4">
                    <div
                        className={`
                        relative flex-1 rounded-2xl border-2 border-dashed border-white/10 bg-black/20 
                        flex flex-col items-center justify-center p-8 transition-all overflow-hidden group
                        ${!image ? 'hover:border-gold-500/30 hover:bg-white/5 cursor-pointer' : ''}
                    `}
                        onClick={() => !image && fileInputRef.current?.click()}
                    >
                        {image ? (
                            <>
                                <img src={image} alt="Analysis Target" className="absolute inset-0 w-full h-full object-contain p-4 z-10" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setImage(null); setAnalysis(''); }}
                                    className="absolute top-4 right-4 z-30 p-2 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors"
                                >
                                    <Upload size={16} className="rotate-45" /> {/* Close icon lookalike */}
                                </button>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Camera size={40} className="text-gold-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Upload de Foto</h3>
                                <p className="text-text-secondary text-sm max-w-xs mx-auto">
                                    Clique para tirar uma foto ou selecionar da galeria. Certifique-se de que o rosto esteja bem iluminado.
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                    </div>

                    <button
                        onClick={analyzeSkin}
                        disabled={!image || loading}
                        className={`
                        w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider shadow-lg transition-all
                        flex items-center justify-center gap-3
                        ${!image
                                ? 'bg-white/5 text-text-muted cursor-not-allowed'
                                : loading
                                    ? 'bg-gold-500/50 text-white cursor-wait'
                                    : 'bg-gradient-to-r from-gold-400 to-gold-600 text-black hover:brightness-110 hover:shadow-gold-500/20'
                            }
                    `}
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-spin" /> Analisando...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} /> Realizar Análise IA
                            </>
                        )}
                    </button>
                </div>

                {/* Right Column: Results */}
                <div className="bg-surface/50 rounded-2xl border border-white/5 p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20 shadow-2xl backdrop-blur-md">
                    {!analysis && !loading && !error && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <Sparkles size={48} className="mb-4 text-gold-500" />
                            <p className="text-lg font-medium text-text-secondary">Os resultados da análise aparecerão aqui.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-white mb-2">Processando Imagem...</h3>
                            <p className="text-text-secondary animate-pulse">A IA está identificando pontos de melhoria.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200">
                            <AlertCircle className="shrink-0 mt-1" />
                            <p>{error}</p>
                        </div>
                    )}

                    {analysis && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Check size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Análise Concluída</h3>
                            </div>

                            <div className="prose prose-invert prose-gold max-w-none">
                                {/* Rendering text with simple whitespace handling, or could allow HTML if trusted. 
                                For safety, passing as plain text with whitespace-pre-wrap 
                            */}
                                <div className="whitespace-pre-wrap text-text-primary leading-relaxed text-sm md:text-base font-light">
                                    {analysis}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-text-secondary transition-colors">
                                    Salvar no Prontuário (Simulação)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
