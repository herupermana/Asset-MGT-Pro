
import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Wand2, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 p-2 rounded-xl">
          <Sparkles className="text-purple-600 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Image Refiner</h2>
          <p className="text-slate-500">Perfect your asset documentation with Gemini 2.5 Flash Image</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-white
              ${isDragging ? 'border-purple-500 bg-purple-50 scale-[1.02]' : image ? 'border-purple-200' : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50'}`}
          >
            {image ? (
              <img src={image} className="w-full h-full object-contain" alt="Preview" />
            ) : (
              <>
                <div className={`bg-slate-50 p-4 rounded-full mb-4 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                  <ImageIcon className={`w-8 h-8 ${isDragging ? 'text-purple-500' : 'text-slate-400'}`} />
                </div>
                <p className={`font-semibold ${isDragging ? 'text-purple-700' : 'text-slate-700'}`}>
                  {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG (Max 5MB)</p>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">AI Edit Prompt</label>
            <textarea 
              placeholder="e.g., 'Increase lighting', 'Highlight the damaged part with a red circle', 'Remove distracting background'..."
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-100 focus:outline-none resize-none transition-all"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              disabled={!image || !prompt || isProcessing}
              onClick={handleEdit}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                ${!image || !prompt || isProcessing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 active:scale-95'}`}
            >
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              {isProcessing ? 'Processing with Gemini...' : 'Apply AI Edit'}
            </button>
          </div>
        </div>

        {/* Result Side */}
        <div className="space-y-4">
          <div className="aspect-video rounded-3xl bg-slate-900 flex items-center justify-center relative overflow-hidden group">
            {resultImage ? (
              <img src={resultImage} className="w-full h-full object-contain" alt="Result" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 blur-sm">
                  <Sparkles className="text-white/20 w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">Edited version will appear here</p>
              </div>
            )}
            
            {resultImage && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white text-slate-900 px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-slate-100">
                  <Download className="w-5 h-5" />
                  Save Revision
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Pro Tip
            </h4>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              Use Gemini to clean up messy backgrounds in maintenance photos to make documentation clearer for auditors and supervisors. You can even ask to "highlight the serial number" or "zoom into the rusted area".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAIRefiner;
