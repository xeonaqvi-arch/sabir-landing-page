import React, { useState } from 'react';
import { GeneratedPage } from '../types';
import { Button } from './Button';
import { Download, Eye, Trash2, Clock, FileCode, Globe, Check, ExternalLink } from 'lucide-react';
import { openInNewTab } from '../utils/preview';
import { downloadProjectFolder } from '../utils/zip';
import { publishPage } from '../services/firebase';

interface HistoryProps {
  pages: GeneratedPage[];
  onDelete: (id: string) => void;
  onUpdate: (page: GeneratedPage) => void;
  userId: string;
}

export const History: React.FC<HistoryProps> = ({ pages, onDelete, onUpdate, userId }) => {
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handlePublish = async (page: GeneratedPage) => {
    setPublishingId(page.id);
    try {
        const publicId = await publishPage(page, userId);
        onUpdate({ ...page, publishedId: publicId });
    } catch (e) {
        console.error("Failed to publish", e);
        alert("Failed to publish page.");
    } finally {
        setPublishingId(null);
    }
  };

  const getPublicUrl = (publishedId: string) => {
    return `${window.location.origin}?p=${publishedId}`;
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No history yet</h3>
        <p className="text-gray-500 mt-1">Generate your first landing page to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {pages.map((page) => (
        <div key={page.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <FileCode className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">{page.title}</h3>
                {page.publishedId && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Globe className="w-3 h-3 mr-1" /> Live
                    </span>
                )}
            </div>
            <p className="text-gray-500 text-sm line-clamp-2 mb-2">{page.prompt}</p>
            <span className="text-xs text-gray-400">
                Created on {new Date(page.createdAt).toLocaleDateString()} at {new Date(page.createdAt).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {page.publishedId ? (
                <Button
                    variant="ghost"
                    onClick={() => window.open(getPublicUrl(page.publishedId!), '_blank')}
                    className="text-indigo-600 hover:bg-indigo-50 flex-1 md:flex-none border border-indigo-100"
                    title="View Live Page"
                    icon={<ExternalLink className="w-4 h-4" />}
                >
                    View Live
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    onClick={() => handlePublish(page)}
                    isLoading={publishingId === page.id}
                    className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 flex-1 md:flex-none border border-transparent hover:border-indigo-100"
                    title="Publish to Web"
                    icon={<Globe className="w-4 h-4" />}
                >
                    Publish
                </Button>
            )}

            <Button 
              variant="secondary" 
              onClick={() => openInNewTab(page)}
              className="flex-1 md:flex-none"
              title="Preview in new tab"
              icon={<Eye className="w-4 h-4" />}
            >
              Preview
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => downloadProjectFolder(page)}
              className="flex-1 md:flex-none"
              title="Download ZIP"
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onDelete(page.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-none"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};