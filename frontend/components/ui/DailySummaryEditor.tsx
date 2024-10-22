// components/ui/DailySummaryEditor.tsx

'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface DailySummaryEditorProps {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  onPublish: () => void;
  loading?: boolean;
  error?: string | null;
}

const DailySummaryEditor: React.FC<DailySummaryEditorProps> = ({
  content,
  setContent,
  onPublish,
  loading = false,
  error = null,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ReactQuill
        value={content}
        onChange={setContent}
        placeholder="Write your daily summary here..."
        theme="snow"
        className="mb-4"
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="text-right">
        <Button
          onClick={onPublish}
          disabled={loading || !content.trim()}
          className={`px-6 py-2 ${loading || !content.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {loading ? 'Publishing...' : 'Publish Summary'}
        </Button>
      </div>
    </div>
  );
};

export default DailySummaryEditor;
