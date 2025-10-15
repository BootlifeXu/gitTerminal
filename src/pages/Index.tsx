import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Terminal } from "lucide-react";
import { toast } from "sonner";
import TerminalInput from "@/components/TerminalInput";
import RepoOverview from "@/components/RepoOverview";
import FileTree from "@/components/FileTree";
import FilePreview from "@/components/FilePreview";

interface TreeNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeNode[];
}

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

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string; path: string } | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const navigate = useNavigate();
  const { owner, repo } = useParams<{ owner?: string; repo?: string }>();

  const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  const buildFileTree = async (
    owner: string,
    repo: string,
    path: string = ""
  ): Promise<TreeNode[]> => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch directory");
      
      const items = await response.json();
      const tree: TreeNode[] = [];

      for (const item of items) {
        if (item.type === "dir") {
          tree.push({
            name: item.name,
            type: "dir",
            path: item.path,
            children: await buildFileTree(owner, repo, item.path),
          });
        } else {
          tree.push({
            name: item.name,
            type: "file",
            path: item.path,
          });
        }
      }

      return tree.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "dir" ? -1 : 1;
      });
    } catch (error) {
      console.error("Error building file tree:", error);
      return [];
    }
  };

  const fetchRepository = async (url: string) => {
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      toast.error("Invalid GitHub URL");
      return;
    }

    const { owner, repo } = parsed;
    setIsLoading(true);
    setSelectedFile(null);

    try {
      // Fetch repo metadata
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      
      if (!repoResponse.ok) {
        const errorData = await repoResponse.json().catch(() => ({}));
        
        if (repoResponse.status === 403 && errorData.message?.includes("rate limit")) {
          throw new Error("GitHub API rate limit exceeded. Please try again in a few minutes or use a different network.");
        } else if (repoResponse.status === 404) {
          throw new Error("Repository not found. Please check the URL.");
        } else {
          throw new Error(`Failed to fetch repository: ${errorData.message || repoResponse.statusText}`);
        }
      }

      const repoJson = await repoResponse.json();
      setRepoData({
        name: repoJson.name,
        description: repoJson.description,
        owner: repoJson.owner.login,
        stars: repoJson.stargazers_count,
        forks: repoJson.forks_count,
        language: repoJson.language,
        updated_at: repoJson.updated_at,
        created_at: repoJson.created_at,
        html_url: repoJson.html_url,
        homepage: repoJson.homepage,
        open_issues: repoJson.open_issues_count,
        watchers: repoJson.watchers_count,
        size: repoJson.size,
        license: repoJson.license?.name || null,
        topics: repoJson.topics || [],
        default_branch: repoJson.default_branch,
        is_fork: repoJson.fork,
      });

      // Build file tree
      const tree = await buildFileTree(owner, repo);
      setFileTree(tree);

      // Try to load README
      try {
        const readmeResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/readme`
        );
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          setReadmeContent(atob(readmeData.content));
        }
      } catch (error) {
        console.log("No README found");
      }

      // Update URL
      navigate(`/${owner}/${repo}`, { replace: true });
      
      toast.success("Repository loaded successfully!");
    } catch (error) {
      console.error("Error fetching repository:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch repository. Please check the URL and try again.";
      toast.error(errorMessage);
      setRepoData(null);
      setFileTree([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = async (path: string) => {
    if (!repoData) return;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoData.owner}/${repoData.name}/contents/${path}`
      );
      const data = await response.json();

      if (data.content) {
        const content = atob(data.content);
        setSelectedFile({ name: path.split("/").pop() || path, content, path });
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      toast.error("Failed to load file");
    }
  };

  // Load repo from URL on mount or when params change
  useEffect(() => {
    if (owner && repo) {
      fetchRepository(`https://github.com/${owner}/${repo}`);
    }
  }, [owner, repo]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="text-primary terminal-glow animate-glow-pulse" size={40} />
            <h1 className="text-5xl font-bold text-primary terminal-glow">GitTerminal</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore GitHub repositories in a terminal-inspired interface
          </p>
          <div className="mt-2 text-sm text-muted-foreground/70">
            <span className="text-terminal-prompt">$</span> analyze · visualize · understand
          </div>
        </div>

        {/* Terminal Input */}
        <TerminalInput onSubmit={fetchRepository} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 text-primary">
              <span className="animate-glow-pulse">◆</span>
              <span>Analyzing repository...</span>
              <span className="terminal-cursor">▊</span>
            </div>
          </div>
        )}

        {/* Results */}
        {repoData && !isLoading && (
          <>
            <RepoOverview data={repoData} />
            
            {/* README Preview */}
            {readmeContent && !selectedFile && (
              <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in">
                <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-terminal-prompt terminal-glow">📖</span>
                    <h3 className="text-lg font-semibold text-primary">README.md</h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none bg-input border border-border/50 rounded p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-foreground">{readmeContent}</pre>
                  </div>
                </div>
              </div>
            )}

            <FileTree tree={fileTree} onFileClick={handleFileClick} />
            
            {selectedFile && (
              <FilePreview
                fileName={selectedFile.name}
                content={selectedFile.content}
                onClose={() => setSelectedFile(null)}
                githubUrl={repoData.html_url}
                filePath={selectedFile.path}
                defaultBranch={repoData.default_branch}
              />
            )}
          </>
        )}

        {/* Footer */}
        {!repoData && !isLoading && (
          <div className="text-center mt-16 text-muted-foreground/50 text-sm animate-fade-in">
            <p>Enter a GitHub repository URL to begin exploring</p>
            <p className="mt-1">
              <span className="text-terminal-prompt">→</span> Fast · Clean · Terminal-inspired
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
