import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

interface FileTreeProps {
  tree: TreeNode[];
  onFileClick?: (path: string) => void;
}

const TreeItem = ({ 
  node, 
  depth = 0,
  onFileClick 
}: { 
  node: TreeNode; 
  depth?: number;
  onFileClick?: (path: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const handleClick = () => {
    if (node.type === "dir") {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick?.(node.path);
    }
  };

  const Icon = node.type === "dir" 
    ? (isExpanded ? FolderOpen : Folder)
    : File;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-accent/10 rounded cursor-pointer transition-colors ${
          node.type === "file" ? "text-foreground" : "text-primary"
        }`}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        onClick={handleClick}
      >
        {node.type === "dir" && (
          <span className="text-muted-foreground">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        <Icon size={16} className={node.type === "dir" ? "text-accent" : "text-secondary"} />
        <span className="text-sm font-medium">{node.name}</span>
      </div>
      {node.type === "dir" && isExpanded && node.children && (
        <div>
          {node.children.map((child, idx) => (
            <TreeItem 
              key={`${child.path}-${idx}`} 
              node={child} 
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ tree, onFileClick }: FileTreeProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-terminal-prompt terminal-glow">├──</span>
          <h3 className="text-lg font-semibold text-primary">Repository Structure</h3>
        </div>
        <div className="bg-input border border-border/50 rounded p-4 max-h-96 overflow-y-auto">
          {tree.map((node, idx) => (
            <TreeItem key={`${node.path}-${idx}`} node={node} onFileClick={onFileClick} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileTree;
