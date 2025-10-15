import { Calendar, Code2, GitFork, Star, Copy, Check, AlertCircle, Eye, Scale, GitBranch, ExternalLink, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RepoData {
  name: string;
  description: string;
  owner: string;
  stars: number;
  forks: number;
  language: string;
  updated_at: string;
  created_at: string;
  html_url: string;
  homepage: string;
  open_issues: number;
  watchers: number;
  size: number;
  license: string | null;
  topics: string[];
  default_branch: string;
  is_fork: boolean;
}

interface RepoOverviewProps {
  data: RepoData;
}

const RepoOverview = ({ data }: RepoOverviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const summary = `
Repository: ${data.owner}/${data.name}
Description: ${data.description || "No description"}
Language: ${data.language || "Not specified"}
Stars: ${data.stars} | Forks: ${data.forks} | Watchers: ${data.watchers}
Open Issues: ${data.open_issues}
License: ${data.license || "No license"}
Created: ${new Date(data.created_at).toLocaleDateString()}
Last Updated: ${new Date(data.updated_at).toLocaleDateString()}
Default Branch: ${data.default_branch}
Size: ${(data.size / 1024).toFixed(2)} MB
${data.topics.length > 0 ? `Topics: ${data.topics.join(", ")}` : ""}
${data.homepage ? `Homepage: ${data.homepage}` : ""}
URL: ${data.html_url}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in">
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-terminal-prompt terminal-glow">●</span>
              <h2 className="text-2xl font-bold text-primary terminal-glow">
                {data.owner}/{data.name}
              </h2>
              {data.is_fork && (
                <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                  Fork
                </span>
              )}
            </div>
            <p className="text-muted-foreground mb-3">
              {data.description || "No description provided"}
            </p>
            
            {/* Topics */}
            {data.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {data.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Homepage Link */}
            {data.homepage && (
              <a
                href={data.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <ExternalLink size={14} />
                <span>{data.homepage}</span>
              </a>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 px-3 py-2 rounded transition-all flex items-center gap-2"
            title="Copy Summary"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-accent" />
            <span className="text-sm">
              <span className="text-accent font-semibold">{data.stars.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">stars</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GitFork size={16} className="text-secondary" />
            <span className="text-sm">
              <span className="text-secondary font-semibold">{data.forks.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">forks</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Eye size={16} className="text-primary" />
            <span className="text-sm">
              <span className="text-primary font-semibold">{data.watchers.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">watchers</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-destructive" />
            <span className="text-sm">
              <span className="text-destructive font-semibold">{data.open_issues.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">issues</span>
            </span>
          </div>
        </div>

        {/* Repository Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-primary" />
            <span className="text-sm">
              <span className="text-primary font-semibold">{data.language || "N/A"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {data.default_branch}
            </span>
          </div>

          {data.license && (
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {data.license}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatSize(data.size)}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Created {new Date(data.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Updated {new Date(data.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoOverview;
