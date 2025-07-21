"use client";

import React, { useEffect, useState } from "react";
import { useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import UMLClassNode from "./components/UMLClassNode";
import { MermaidParser } from "./components/MermaidParser";
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor";
import DiagramCanvas from "./components/DiagramCanvas";

const nodeTypes = { umlClass: UMLClassNode };

export default function Home() {
  const defaultCode = `classDiagram
    note "From Duck till Zebra"
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }`;

  const [code, setCode] = useState(defaultCode);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = MermaidParser(code);

    const sourceIds = new Set(parsedEdges.map((e) => e.source));
    const targetIds = new Set(parsedEdges.map((e) => e.target));

    const nodesWithHandles = parsedNodes.map((node) => ({
      ...node,
      type: "umlClass",
      data: {
        ...node.data,
        isSource: sourceIds.has(node.id),
        isTarget: targetIds.has(node.id),
      },
    }));

    setNodes(nodesWithHandles);
    setEdges(parsedEdges);
  }, [code, setEdges, setNodes]);

  return (
    <div className="h-screen">
      <Header />
      <div className="flex h-[calc(100vh-48px)]">
        <CodeEditor code={code} setCode={setCode} />
        <DiagramCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
        />
      </div>
    </div>
  );
}
