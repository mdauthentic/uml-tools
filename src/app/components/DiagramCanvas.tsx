"use client";

import React, { useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
} from "reactflow";
import { toPng, toSvg } from "html-to-image";
import jsPDF from "jspdf";

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  nodeTypes: NodeTypes;
}

const DiagramCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
}: Props) => {
  const flowWrapper = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = React.useState(false);

  const downloadAsPng = async () => {
    if (!flowWrapper.current) return;
    setIsExporting(true);

    // allow DOM to update (remove background/buttons)
    await new Promise((r) => setTimeout(r, 0));

    const dataUrl = await toPng(flowWrapper.current, {
      filter: (node) => {
        // skip elements with 'exclude-from-export' class
        const className = (node as HTMLElement).className || "";
        return !className.toString().includes("exclude-from-export");
      },
    });

    const link = document.createElement("a");
    link.download = "diagram.png";
    link.href = dataUrl;
    link.click();
    setIsExporting(false);
  };

  const downloadAsSvg = async () => {
    if (!flowWrapper.current) return;
    const dataUrl = await toSvg(flowWrapper.current);
    const link = document.createElement("a");
    link.download = "diagram.svg";
    link.href = dataUrl;
    link.click();
  };

  const downloadAsPdf = async () => {
    if (!flowWrapper.current) return;
    const dataUrl = await toPng(flowWrapper.current);
    const pdf = new jsPDF("landscape", "pt", "a4");
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("diagram.pdf");
  };

  return (
    <div className="h-full w-8/12">
      <div className="flex h-8 items-center justify-end bg-transparent px-4">
        {/* <span>Hello World</span> */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={downloadAsPng}
            className="cursor-pointer rounded-sm bg-sky-600 px-2 py-1 text-white shadow-custom transition-all delay-[0s] duration-[0.4s] ease-[ease-out] hover:scale-105"
          >
            Export PNG
          </button>
          <button
            onClick={downloadAsSvg}
            className="cursor-pointer rounded-sm bg-teal-600 px-2 py-1 text-white shadow-custom transition-all delay-[0s] duration-[0.4s] ease-[ease-out] hover:scale-105"
          >
            Export SVG
          </button>
          <button
            onClick={downloadAsPdf}
            className="cursor-pointer rounded-sm bg-red-600 px-2 py-1 text-white shadow-custom transition-all delay-[0s] duration-[0.4s] ease-[ease-out] hover:scale-105"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div
        ref={flowWrapper}
        className="h-[calc(100%-2rem)] w-full"
        style={{
          backgroundColor: isExporting ? "#ffffff" : "transparent",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 1 }}
        >
          {!isExporting && (
            <>
              <Background
                className="exclude-from-export"
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
              />
              <Controls className="exclude-from-export" />
            </>
          )}
        </ReactFlow>
      </div>
    </div>
  );
};

export default DiagramCanvas;
