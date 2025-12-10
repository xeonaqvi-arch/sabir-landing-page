import React, { useState } from 'react';
import { generateLandingPage } from '../services/gemini';
import { GeneratedPage } from '../types';
import { Button } from './Button';
import { Sparkles, Eye, Download, Code, Globe, Check, Copy, ExternalLink } from 'lucide-react';
import { openInNewTab } from '../utils/preview';
import { downloadProjectFolder } from '../utils/zip';
import { publishPage } from '../services/firebase';

interface GeneratorProps {
  onSave: (page: GeneratedPage) => void;
  onUpdate: (page: GeneratedPage) => void;
  userId: string;
}

export const Generator: React.FC<GeneratorProps> = ({ onSave, onUpdate, userId }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GeneratedPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setCurrentResult(null);
    setPublishUrl(null);

    try {
      const data = await generateLandingPage(prompt);
      const newPage: GeneratedPage = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        prompt: prompt,
        userId: userId,
        ...data
      };
      
      setCurrentResult(newPage);
      onSave(newPage);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!currentResult || !userId) return;
    setIsPublishing(true);
    try {
        const publicId = await publishPage(currentResult, userId);
        const url = `${window.location.origin}?p=${publicId}`;
        setPublishUrl(url);
        
        // Update local state with publishedId
        const updatedPage = { ...currentResult, publishedId: publicId };
        setCurrentResult(updatedPage);
        onUpdate(updatedPage);
    } catch (err) {
        console.error(err);
        alert("Failed to publish page. Please try again.");
    } finally {
        setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    if (publishUrl) {
        navigator.clipboard.writeText(publishUrl);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Describe your dream landing page</h2>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., A minimalist landing page for a coffee subscription box with a hero image, features grid, pricing table, and a newsletter signup form. Use warm brown and cream colors."
          className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all outline-none text-gray-700 placeholder-gray-400"
        />

        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            disabled={!prompt.trim()}
            className="w-full sm:w-auto"
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Dreaming up design...' : 'Generate Page'}
          </Button>
        </div>
        
        {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
                <span className="mr-2">⚠️</span> {error}
            </div>
        )}
      </div>

      {/* Results Section */}
      {currentResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentResult.title}</h3>
                <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{currentResult.prompt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                onClick={() => openInNewTab(currentResult)}
                icon={<Eye className="w-4 h-4" />}
              >
                Preview
              </Button>
              <Button 
                variant="primary" 
                onClick={() => downloadProjectFolder(currentResult)}
                icon={<Download className="w-4 h-4" />}
              >
                Download Code
              </Button>
              {!publishUrl && !currentResult.publishedId ? (
                <Button 
                    variant="secondary"
                    onClick={handlePublish}
                    isLoading={isPublishing}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    icon={<Globe className="w-4 h-4" />}
                >
                    Publish Live
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                    <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" /> Live
                    </span>
                </div>
              )}
            </div>
          </div>

          {/* Published Link Section */}
          {(publishUrl || currentResult.publishedId) && (
             <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">Public Link</p>
                        <p className="text-sm text-indigo-700 truncate">
                            {publishUrl || `${window.location.origin}?p=${currentResult.publishedId}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex-1 sm:flex-none justify-center"
                    >
                        {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {hasCopied ? 'Copied' : 'Copy'}
                    </button>
                    <a 
                        href={publishUrl || `${window.location.origin}?p=${currentResult.publishedId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex-1 sm:flex-none justify-center"
                    >
                        Open <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
             </div>
          )}
          
          <div className="bg-gray-50 p-6 flex justify-center items-center min-h-[200px]">
             <div className="text-center space-y-4 max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
                    <Code className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Page Generated Successfully</h4>
                <p className="text-gray-500 text-sm">
                    Use the buttons above to preview, download the source code, or publish it to the web instantly.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};