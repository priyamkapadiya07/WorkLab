import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, GitBranch as Github, ExternalLink, Calendar, Star, GitFork, RefreshCw, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/ProjectModal';
import { useProjects } from '../context/ProjectContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshProjects } = useProjects();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This will remove it from your DevVault (but not from GitHub).')) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/projects/${id}`);
      await refreshProjects();
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project', error);
      setDeleting(false);
    }
  };

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/projects/${id}`);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project', error);
      if (error.response?.status === 404) navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.post(`/api/github/sync/${id}`);
      setProject(data);
    } catch (error) {
      console.error('Failed to sync', error);
    } finally {
      setSyncing(false);
    }
  };

  const checkDeployment = async () => {
    if (!project.liveUrl) return;
    setChecking(true);
    try {
      const { data } = await axios.post(`/api/projects/${id}/check-deployment`);
      setProject({ ...project, deploymentStatus: data.status, lastDeploymentCheck: data.lastChecked });
    } catch (error) {
      console.error('Check failed', error);
    } finally {
      setChecking(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-16 w-3/4 mb-12" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/projects" className="text-[var(--color-muted-foreground)] hover:text-white transition-colors inline-flex items-center text-sm font-mono">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 pb-8 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-mono font-bold tracking-tight">{project.name}</h1>
            {project.featured && <Badge variant="success">Featured</Badge>}
          </div>
          <p className="text-[var(--color-muted-foreground)] max-w-2xl text-lg">
            {project.customDescription || project.github?.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2"/> Edit Metadata
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete} 
            disabled={deleting}
            className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white border-[var(--color-destructive)]/30 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2"/> {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: DevVault info & GitHub Sync */}
        <div className="md:col-span-2 space-y-8">
          
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs uppercase text-[var(--color-muted-foreground)] font-mono font-bold mb-1">Status</h4>
                <div className="font-medium text-white">{project.status}</div>
              </div>
              <div>
                <h4 className="text-xs uppercase text-[var(--color-muted-foreground)] font-mono font-bold mb-1">Type</h4>
                <div className="font-medium text-white">{project.type}</div>
              </div>
              
              <div className="col-span-2">
                <h4 className="text-xs uppercase text-[var(--color-muted-foreground)] font-mono font-bold mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.length > 0 ? project.technologies.map(tech => (
                    <Badge key={tech} variant="secondary" className="font-mono">{tech}</Badge>
                  )) : <span className="text-sm text-[var(--color-muted-foreground)]">No technologies listed</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {project.github?.repositoryId && (
            <Card className="bg-transparent border border-dashed border-[var(--color-border)]">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Github className="h-5 w-5" /> GitHub Source
                  </CardTitle>
                  <Button variant="secondary" size="sm" onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`h-3 w-3 mr-2 ${syncing ? 'animate-spin' : ''}`} /> 
                    {syncing ? 'Syncing...' : 'Sync Data'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-mono border-t border-dashed border-[var(--color-border)]">
                <div>
                  <div className="text-[var(--color-muted-foreground)] mb-1">Stars</div>
                  <div className="flex items-center gap-1 text-white"><Star className="h-3 w-3" /> {project.github.stars}</div>
                </div>
                <div>
                  <div className="text-[var(--color-muted-foreground)] mb-1">Forks</div>
                  <div className="flex items-center gap-1 text-white"><GitFork className="h-3 w-3" /> {project.github.forks}</div>
                </div>
                <div>
                  <div className="text-[var(--color-muted-foreground)] mb-1">Language</div>
                  <div className="text-white">{project.github.language || '-'}</div>
                </div>
                <div>
                  <div className="text-[var(--color-muted-foreground)] mb-1">Last Synced</div>
                  <div className="text-white text-xs">{project.github.lastSyncedAt ? new Date(project.github.lastSyncedAt).toLocaleDateString() : 'Never'}</div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Deployment & Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-[var(--color-border)]">
              <CardTitle className="text-lg">Deployment</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <Badge 
                  variant={
                    project.deploymentStatus === 'Live' ? 'success' : 
                    project.deploymentStatus === 'Unavailable' ? 'destructive' : 'outline'
                  } 
                  className="px-3 py-1"
                >
                  {project.deploymentStatus}
                </Badge>
                
                {project.liveUrl && (
                  <button onClick={checkDeployment} disabled={checking} className="text-xs font-mono text-[var(--color-muted-foreground)] hover:text-white transition-colors flex items-center">
                    <RefreshCw className={`h-3 w-3 mr-1 ${checking ? 'animate-spin' : ''}`} /> 
                    {checking ? 'Checking...' : 'Check Status'}
                  </button>
                )}
              </div>

              {project.liveUrl ? (
                <div>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline flex items-center gap-2 mb-2 font-medium break-all">
                    <ExternalLink className="h-4 w-4 shrink-0" /> {project.liveUrl}
                  </a>
                  {project.lastDeploymentCheck && (
                    <div className="text-xs text-[var(--color-muted-foreground)] font-mono mt-4 border-t border-[var(--color-border)] pt-4">
                      Last Checked: {new Date(project.lastDeploymentCheck).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-muted-foreground)] text-center py-4">
                  No live URL configured.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.github?.url && (
                <a href={project.github.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-[var(--color-background)] hover:bg-[var(--color-muted)] transition-colors border border-[var(--color-border)] text-sm">
                  <Github className="h-5 w-5" /> View on GitHub
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md bg-[var(--color-background)] hover:bg-[var(--color-muted)] transition-colors border border-[var(--color-border)] text-sm">
                  <ExternalLink className="h-5 w-5" /> Open App
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={project}
        onSaved={() => {
          fetchProject();
          refreshProjects();
        }} 
      />
    </div>
  );
};

export default ProjectDetails;
