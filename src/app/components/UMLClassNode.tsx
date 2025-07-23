import { Handle, NodeProps, Position } from "reactflow";
import { memo } from "react";

interface UMLNodeData {
  label: string;
  isTarget?: boolean;
  isSource?: boolean;
}

interface UMLClassNodeProps extends NodeProps {
  data: UMLNodeData;
}

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-gray-400 italic">{text}</div>
);

const ItemList = ({
  items,
  emptyText,
}: {
  items: string[];
  emptyText: string;
}) => (
  <>
    {items.length === 0 ? (
      <EmptyState text={emptyText} />
    ) : (
      items.map((item, i) => (
        <div key={i} className="py-0.5 text-accent">
          {item}
        </div>
      ))
    )}
  </>
);

function UMLClassNode({ data }: UMLClassNodeProps) {
  const lines = data.label.split("\n");
  const [className, ...contentLines] = lines;

  const { attributes, methods } = contentLines.reduce(
    (acc, line) => {
      if (line.includes("(")) {
        acc.methods.push(line);
      } else {
        acc.attributes.push(line);
      }
      return acc;
    },
    { attributes: [] as string[], methods: [] as string[] },
  );

  return (
    <div className="min-w-[140px] font-mono">
      <div className="relative rounded-t-sm border-[0.7px] border-secondary bg-primary px-1.5 py-0.5 text-xs font-medium text-accent">
        {className}
      </div>

      <div className="flex flex-col rounded-b-sm border-x-[0.7px] border-b-[0.5px] border-secondary">
        <div className="border-b-[0.7px] border-b-secondary px-2 py-1 text-xs">
          <ItemList items={attributes} emptyText="No attributes" />
        </div>

        <div className="px-2 py-1 text-xs">
          <ItemList items={methods} emptyText="No methods" />
        </div>
      </div>

      {data.isTarget && <Handle type="target" position={Position.Top} />}
      {data.isSource && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

export default memo(UMLClassNode);
