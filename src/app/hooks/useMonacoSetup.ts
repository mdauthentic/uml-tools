"use client";

import { useEffect } from "react";
import { loader } from "@monaco-editor/react";

const useMonacoSetup = () => {
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: "mermaid" });

      monaco.languages.setMonarchTokensProvider("mermaid", {
        tokenizer: {
          root: [
            [/classDiagram/, "keyword"],
            [/class\b/, "keyword"],
            [/note\b/, "keyword"],
            [/<\|--|--\|>|--|o--|\*--/, "operator"],
            [/[{}]/, "delimiter.bracket"],
            [/".*?"/, "string"],
            [/\/\/.*$/, "comment"],
            [/\b[A-Z][A-Za-z0-9_]*\b/, "identifier"],
            [/[+-]/, "modifier"],
          ],
        },
      });

      monaco.editor.defineTheme("mermaidTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "#b3d77e" },
          { token: "operator", foreground: "#d4d4d4" },
          { token: "string", foreground: "#ce9178" },
          { token: "comment", foreground: "#6a9955" },
          { token: "modifier", foreground: "#c586c0" },
          { token: "delimiter", foreground: "#cccccc" },
          { token: "identifier", foreground: "#ffb84a" },
        ],
        colors: {
          "editor.foreground": "#228c30",
          "editor.background": "#191724",
          "editor.lineHighlightBackground": "#232136",
        },
      });

      monaco.languages.registerCompletionItemProvider("mermaid", {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          const suggestions = [
            {
              label: "classDiagram",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "classDiagram",
              range,
            },
            {
              label: "class",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "class ${1:ClassName} {\n\t$2\n}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Define a class",
              range,
            },
            {
              label: "note",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'note for ${1:ClassName} "${2:your note}"',
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Attach a note to a class",
              range,
            },
            {
              label: "<|--",
              kind: monaco.languages.CompletionItemKind.Operator,
              insertText: "<|--",
              documentation: "Inheritance arrow",
              range,
            },
            {
              label: "+ method()",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "+${1:method}()",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: "+ attribute: Type",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: "+${1:name}: ${2:Type}",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
          ];
          return { suggestions };
        },
      });
    });
  }, []);
};

export default useMonacoSetup;
