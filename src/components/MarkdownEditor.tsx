// src/components/MarkdownEditor.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write here...'
}) => {
  const [isPreview, setIsPreview] = useState(false);
  
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-sm rounded-md ${!isPreview ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-sm rounded-md ${isPreview ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
          >
            Preview
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Supports markdown
        </div>
      </div>
      
      {/* Editor/Preview */}
      <div className="min-h-[200px]">
        {isPreview ? (
          <div className="p-4 prose prose-sm max-w-none min-h-[200px] bg-white">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">No content to display</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[200px] p-4 border-none focus:ring-0 resize-y"
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
