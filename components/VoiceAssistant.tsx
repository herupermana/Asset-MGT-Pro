
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, History, Send } from 'lucide-react';
import { gemini, encode } from '../services/geminiService';
import { ConversationMessage } from '../types';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'responding'>('idle');

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const toggleVoice = async () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const startSession = async () => {
    setStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      sessionRef.current = await gemini.connectLive({
        onOpen: () => {
          setIsActive(true);
          setStatus('listening');
          startStreamingInput(inputCtx, stream);
        },
        onAudio: (buffer) => {
          playAudioBuffer(buffer, outputCtx);
          setStatus('responding');
        },
        onTranscription: (text, isUser) => {
          setMessages(prev => [...prev, { role: isUser ? 'user' : 'assistant', text, timestamp: new Date() }]);
          if (!isUser) setStatus('listening');
        },
        onError: (err) => {
          console.error("Live Error:", err);
          stopSession();
        },
        onClose: () => {
          stopSession();
        }
      });
    } catch (err) {
      alert("Microphone access is required for voice assistant.");
      setStatus('idle');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    setIsRecording(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    sessionRef.current = null;
  };

  const startStreamingInput = (ctx: AudioContext, stream: MediaStream) => {
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
      }
      
      const pcmData = encode(new Uint8Array(int16.buffer));
      sessionRef.current?.sendRealtimeInput({
        media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  };

  const playAudioBuffer = (buffer: AudioBuffer, ctx: AudioContext) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Volume2 className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Voice Operations</h2>
            <p className="text-slate-500">Real-time conversational asset manager</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === 'listening' ? 'bg-emerald-500 animate-pulse' : status === 'responding' ? 'bg-blue-500 animate-bounce' : 'bg-slate-300'}`} />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{status}</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Mic className="w-10 h-10 text-slate-300" />
              </div>
              <div className="max-w-xs">
                <p className="text-slate-800 font-semibold text-lg">Speak to your assets</p>
                <p className="text-slate-500 text-sm">Ask about asset status, schedule maintenance, or query technician availability.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Waveform Visualizer simulation */}
        {isActive && (
          <div className="h-16 flex items-center justify-center gap-1 bg-slate-50 px-8">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-blue-400 rounded-full animate-pulse"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="p-8 border-t border-slate-50 flex items-center justify-center">
          <button 
            onClick={toggleVoice}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
              ${isActive 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:scale-105'}`}
          >
            {isActive ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['"Show me status of Server HP-001"', '"Find electrical technician"', '"Create SPK for HVAC unit"'].map((hint, i) => (
          <button key={i} className="text-xs text-slate-400 bg-white/50 border border-slate-200 py-2 rounded-xl hover:bg-white transition-colors">
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceAssistant;
