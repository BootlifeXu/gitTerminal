import { useState } from "react";
import { Search } from "lucide-react";

interface TerminalInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const TerminalInput = ({ onSubmit, isLoading }: TerminalInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary terminal-glow">$</span>
          <span className="text-muted-foreground">git-explore</span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 terminal-glow"
          >
            <Search size={18} />
            {isLoading ? "Analyzing..." : "Explore"}
          </button>
        </form>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <span className="text-terminal-prompt">→</span> Enter a GitHub repository URL to analyze its structure
        </div>
      </div>
    </div>
  );
};

export default TerminalInput;
