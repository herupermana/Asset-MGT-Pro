
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, History, Send, Loader2 } from 'lucide-react';
import { gemini, encode, decode, decodeAudioData } from '../services/geminiService';
import { ConversationMessage } from '../types';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'responding'>('idle');

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isComponentActive = useRef(true);

  useEffect(() => {
    isComponentActive.current = true;
    return () => {
      isComponentActive.current = false;
      stopSession();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleVoice = async () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    outputAudioContextRef.current?.close();
    outputAudioContextRef.current = null;
    sessionPromiseRef.current = null;
    // Clear playback sources
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    setStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!isComponentActive.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = gemini.connectLive({
        onOpen: () => {
          if (!isComponentActive.current) return;
          setIsActive(true);
          setStatus('listening');
          startStreamingInput(inputCtx, stream, sessionPromise);
        },
        // Decoding audio locally to avoid cross-AudioContext errors
        onAudioData: async (base64) => {
          if (!isComponentActive.current || !outputAudioContextRef.current) return;
          const bytes = decode(base64);
          const buffer = await decodeAudioData(bytes, outputAudioContextRef.current, 24000, 1);
          playAudioBuffer(buffer, outputAudioContextRef.current);
          setStatus('responding');
        },
        onInterrupted: () => {
          // Properly handling barge-in/interruptions as per SDK guidelines
          sourcesRef.current.forEach(s => {
            try { s.stop(); } catch(e) {}
          });
          sourcesRef.current.clear();
          nextStartTimeRef.current = 0;
        },
        onTranscription: (text, isUser) => {
          if (!isComponentActive.current) return;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === (isUser ? 'user' : 'assistant')) {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, text: last.text + text };
              return updated;
            }
            return [...prev, { role: isUser ? 'user' : 'assistant', text, timestamp: new Date() }];
          });
          if (!isUser) setStatus('listening');
        },
        onError: (err) => {
          console.error("Live Error:", err);
          stopSession();
        },
        // Fixed: Use onClose instead of onclose to match the connectLive parameter definition
        onClose: () => {
          stopSession();
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("Microphone access failed:", err);
      setStatus('idle');
      alert("Microphone access is required for the voice assistant. Please check your browser permissions.");
    }
  };

  const startStreamingInput = (ctx: AudioContext, stream: MediaStream, sessionPromise: Promise<any>) => {
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (!isActive) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
      }
      
      const pcmData = encode(new Uint8Array(int16.buffer));
      // Solely relying on sessionPromise resolves without other condition checks inside then
      sessionPromise.then((session) => {
        session.sendRealtimeInput({
          media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' }
        });
      });
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  };

  const playAudioBuffer = (buffer: AudioBuffer, ctx: AudioContext) => {
    if (!ctx || ctx.state === 'closed') return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    // Using persistent nextStartTime for gapless playback
    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    
    sourcesRef.current.add(source);
    source.onended = () => {
      sourcesRef.current.delete(source);
    };
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Volume2 className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Voice Operations</h2>
            <p className="text-slate-500">Real-time conversational asset manager powered by Gemini 2.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'connecting' ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              status === 'listening' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
              status === 'responding' ? 'bg-blue-500 animate-bounce' : 'bg-slate-300'
            }`} />
          )}
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{status}</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative group">
        <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center relative">
                <Mic className="w-12 h-12 text-slate-300" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="max-w-xs">
                <p className="text-slate-800 font-bold text-xl mb-2">Speak to your assets</p>
                <p className="text-slate-500 text-sm leading-relaxed">Ask about asset status, schedule maintenance, or query technician availability. Voice AI can see all enterprise data.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[24px] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {isActive && (
          <div className="h-12 flex items-center justify-center gap-1 bg-slate-50/50 px-8 border-t border-slate-50">
            {[...Array(32)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 rounded-full transition-all duration-100 ${status === 'responding' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                style={{ 
                  height: `${Math.random() * (status === 'listening' ? 40 : 100)}%`,
                  opacity: 0.3 + Math.random() * 0.7,
                  animation: 'pulse 1s infinite',
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="p-10 border-t border-slate-50 flex flex-col items-center justify-center bg-slate-50/20">
          <button 
            onClick={toggleVoice}
            disabled={status === 'connecting'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative
              ${isActive 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 active:scale-90' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:scale-105 active:scale-95'}`}
          >
            {isActive ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            {isActive && (
               <div className="absolute -inset-2 rounded-full border-2 border-rose-500/20 animate-ping" />
            )}
          </button>
          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isActive ? 'Tap to stop' : 'Tap to start conversation'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pb-4">
        {['"Status of Server AST-001?"', '"Available IT technicians?"', '"Create repair ticket for HVAC"'].map((hint, i) => (
          <button 
            key={i} 
            className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-full hover:border-blue-300 hover:text-blue-500 transition-all shadow-sm"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceAssistant;
