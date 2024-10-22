// frontend/components/ui/DailySummaryEditor.tsx

import React from 'react';
import { Button } from "@/components/ui/button";

interface DailySummaryEditorProps {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  onPublish: () => void;
}

const DailySummaryEditor: React.FC<DailySummaryEditorProps> = ({
  content,
  setContent,
  onPublish,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <textarea
        className="w-full h-40 p-2 border border-gray-300 rounded-md"
        placeholder="Write your daily summary here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <div className="text-right mt-4">
        <Button
          onClick={onPublish}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Publish Summary
        </Button>
      </div>
    </div>
  );
};

export default DailySummaryEditor;
