import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAssessmentStore } from '../store/useAssessmentStore';

interface EditorPaneProps {
  questionId: string;
  boilerplate: string;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ questionId, boilerplate }) => {
  const codeMap = useAssessmentStore((state) => state.userCode);
  const updateCode = useAssessmentStore((state) => state.updateCode);

  const currentCode = codeMap[questionId] !== undefined ? codeMap[questionId] : boilerplate;

  useEffect(() => {
    // If we switch to a new question without code, setup boilerplate.
    if (codeMap[questionId] === undefined) {
      updateCode(questionId, boilerplate);
    }
  }, [questionId, boilerplate, codeMap, updateCode]);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
      <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
        <span className="text-sm text-zinc-400 font-mono">main.go</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="go"
          theme="vs-dark"
          value={currentCode}
          onChange={(val) => {
            if (val !== undefined) {
              updateCode(questionId, val);
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"Fira Code", monospace',
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};
