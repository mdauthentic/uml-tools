"use client";

import { Editor } from "@monaco-editor/react";
import useMonacoSetup from "../hooks/useMonacoSetup";

interface Props {
  code: string;
  setCode: (code: string) => void;
}

const CodeEditor = ({ code, setCode }: Props) => {
  useMonacoSetup();

  return (
    <div className="h-full w-4/12">
      <Editor
        width="100%"
        height="100%"
        language="mermaid"
        theme="mermaidTheme"
        value={code}
        onChange={(newValue) => setCode(newValue ?? "")}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 13,
          fontLigatures: true,
          lineNumbers: "on",
          automaticLayout: true,
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
