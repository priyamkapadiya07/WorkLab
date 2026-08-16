import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GitBranch as Github, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GithubSync = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRepos();
  }, []);

  const [authError, setAuthError] = useState(false);

  const fetchRepos = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      const { data } = await axios.get('/api/github/repositories');
      setRepos(data);
    } catch (error) {
      console.error('Failed to fetch repositories', error);
      if (error.response?.status === 401 || (error.response?.status === 500 && error.response?.data?.error?.includes('Bad credentials'))) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (repo) => {
    setImporting(repo.id);
    try {
      const { data } = await axios.post('/api/github/import', {
        repositoryId: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.url,
        visibility: repo.visibility,
        language: repo.language,
        stars: repo.stars,
        forks: repo.forks,
        defaultBranch: repo.defaultBranch
      });
      // Update local state to mark as imported
      setRepos(repos.map(r => r.id === repo.id ? { ...r, isImported: true } : r));
    } catch (error) {
      console.error('Import failed', error);
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif italic tracking-tight mb-2 flex items-center gap-3">
            <Github className="h-8 w-8" /> GitHub Repository Sync
          </h1>
          <p className="text-[var(--color-muted-foreground)]">Import your GitHub repositories to track them in WorkLeb.</p>
        </div>
        <Button variant="outline" onClick={fetchRepos} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-md bg-[var(--color-card)] animate-pulse border border-[var(--color-border)]" />)}
        </div>
      ) : (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
          {/* Mobile View: Cards */}
          <div className="block md:hidden divide-y divide-[var(--color-border)]">
            {repos.map((repo) => (
              <div key={repo.id} className="p-4 space-y-4 hover:bg-[var(--color-background)]/50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-semibold text-[var(--color-foreground)]">{repo.name}</div>
                    <div className="text-[var(--color-muted-foreground)] text-xs mt-1">{repo.description || 'No description'}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-mono shrink-0 ${repo.visibility === 'public' ? 'bg-[var(--color-muted)] text-white' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                    {repo.visibility}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]/50">
                  <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
                    {repo.language || '-'}
                  </span>
                  {repo.isImported ? (
                    <span className="inline-flex items-center text-[var(--color-accent)] font-medium text-xs">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Imported
                    </span>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleImport(repo)}
                      disabled={importing === repo.id}
                    >
                      {importing === repo.id ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Import
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {authError ? (
              <div className="p-8 text-center text-red-400 text-sm">
                Your GitHub connection has expired or is invalid. Please log out and log back in to reconnect.
              </div>
            ) : repos.length === 0 && !loading && (
              <div className="p-8 text-center text-[var(--color-muted-foreground)] text-sm">
                No repositories found on your GitHub account.
              </div>
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--color-muted-foreground)] uppercase bg-[var(--color-background)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 font-serif font-medium">Repository</th>
                  <th className="px-6 py-4 font-serif font-medium">Language</th>
                  <th className="px-6 py-4 font-serif font-medium">Visibility</th>
                  <th className="px-6 py-4 font-serif font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {repos.map((repo) => (
                  <tr key={repo.id} className="hover:bg-[var(--color-background)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-foreground)]">{repo.name}</div>
                      <div className="text-[var(--color-muted-foreground)] text-xs mt-1 truncate max-w-xs">{repo.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {repo.language || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-mono ${repo.visibility === 'public' ? 'bg-[var(--color-muted)] text-white' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                        {repo.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {repo.isImported ? (
                        <span className="inline-flex items-center text-[var(--color-accent)] font-medium text-xs">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Imported
                        </span>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleImport(repo)}
                          disabled={importing === repo.id}
                        >
                          {importing === repo.id ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3 mr-1" />
                          )}
                          Import
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {authError ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-red-400">
                      Your GitHub connection has expired or is invalid. Please log out and log back in to reconnect.
                    </td>
                  </tr>
                ) : repos.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-[var(--color-muted-foreground)]">
                      No repositories found on your GitHub account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubSync;
