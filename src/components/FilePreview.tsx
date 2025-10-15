import { X, ExternalLink, Download, Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { toast } from "sonner";

interface FilePreviewProps {
  fileName: string;
  content: string;
  onClose: () => void;
  githubUrl?: string;
  filePath?: string;
  defaultBranch?: string;
}

const getLanguage = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    md: "markdown",
    json: "json",
    html: "html",
    css: "css",
    yml: "yaml",
    yaml: "yaml",
    sh: "bash",
    txt: "text",
  };
  return langMap[ext || ""] || "text";
};

const FilePreview = ({ fileName, content, onClose, githubUrl, filePath, defaultBranch = "main" }: FilePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Content copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const handleOpenGitHub = () => {
    if (githubUrl && filePath) {
      window.open(`${githubUrl}/blob/${defaultBranch}/${filePath}`, "_blank");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-input border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-accent terminal-glow">●</span>
            <span className="text-sm font-semibold text-foreground">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Copy content"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Download file"
            >
              <Download size={16} />
            </button>
            {githubUrl && filePath && (
              <button
                onClick={handleOpenGitHub}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="View on GitHub"
              >
                <ExternalLink size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-auto">
          <SyntaxHighlighter
            language={getLanguage(fileName)}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "hsl(var(--input))",
              fontSize: "0.875rem",
            }}
            showLineNumbers
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
