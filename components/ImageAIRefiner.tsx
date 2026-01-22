
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Wand2, RefreshCw, Download, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { gemini } from '../services/geminiService';

const ImageAIRefiner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    
    setIsProcessing(true);
    try {
      const edited = await gemini.editAssetImage(image, prompt);
      setResultImage(edited);
    } catch (err) {
      alert("Error editing image: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `refined-asset-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-purple-100 p-3 rounded-2xl">
          <Sparkles className="text-purple-600 w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AI Asset Refiner</h2>
          <p className="text-slate-500 font-medium">Visual documentation mastery with Gemini 2.5 Flash Image</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Side */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`aspect-video rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-white shadow-sm
              ${isDragging ? 'border-purple-500 bg-purple-50 scale-[1.02]' : image ? 'border-purple-200' : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50'}`}
          >
            {image ? (
              <img src={image} className="w-full h-full object-contain p-4" alt="Preview" />
            ) : (
              <div className="text-center p-12">
                <div className={`bg-slate-50 p-6 rounded-3xl mb-4 transition-transform inline-block ${isDragging ? 'scale-110 shadow-lg' : ''}`}>
                  <ImageIcon className={`w-10 h-10 ${isDragging ? 'text-purple-500' : 'text-slate-400'}`} />
                </div>
                <p className={`font-bold text-lg ${isDragging ? 'text-purple-700' : 'text-slate-700'}`}>
                  {isDragging ? 'Drop it here!' : 'Add Maintenance Photo'}
                </p>
                <p className="text-sm text-slate-400 mt-1 max-w-[200px] mx-auto">Drop your asset photos here to enhance them with AI</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 block uppercase tracking-widest">Editing Instructions</label>
              <div className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold">GEMINI 2.5 ACTIVE</div>
            </div>
            <textarea 
              placeholder="e.g., 'Increase visibility in the dark areas', 'Add a circle around the rust spot', 'Brighten up the serial number plate'..."
              className="w-full h-36 p-5 rounded-[20px] border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:outline-none focus:border-purple-300 resize-none transition-all text-slate-700"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              disabled={!image || !prompt || isProcessing}
              onClick={handleEdit}
              className={`w-full py-4 rounded-[20px] font-bold flex items-center justify-center gap-3 transition-all
                ${!image || !prompt || isProcessing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-100 active:scale-95'}`}
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              {isProcessing ? 'Gemini is refining...' : 'Apply Intelligent Refinement'}
            </button>
          </div>
        </div>

        {/* Result Side */}
        <div className="space-y-6">
          <div className="aspect-video rounded-[32px] bg-slate-900 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            {resultImage ? (
              <>
                <img src={resultImage} className="w-full h-full object-contain p-4 animate-in zoom-in duration-500" alt="Result" />
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-emerald-500/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Refinement Applied</span>
                </div>
              </>
            ) : (
              <div className="text-center p-12 space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto relative">
                   <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
                   <Sparkles className="text-white/10 w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold">Awaiting Refinement</p>
                  <p className="text-slate-600 text-xs">AI output will be displayed here in high resolution</p>
                </div>
              </div>
            )}
            
            {resultImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                <button 
                  onClick={handleDownload}
                  className="bg-white text-slate-900 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-slate-100 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl"
                >
                  <Download className="w-5 h-5" />
                  Download Revision
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-xl text-slate-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-bold text-white">Documentation Assistant</h4>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-400">
              <p>
                Our AI model is specialized in technical imagery. It can identify serial numbers, corrosion levels, and wiring complexities.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider">Highlighting</p>
                  <p className="text-xs">Direct attention to specific faults or components.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-[10px] font-bold text-purple-400 mb-1 uppercase tracking-wider">Cleanup</p>
                  <p className="text-xs">Remove background clutter to focus on the asset.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAIRefiner;
