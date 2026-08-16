import { useProjects } from '../../context/ProjectContext';
import { Card, CardContent } from './Card';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, HelpCircle, Activity } from 'lucide-react';

const timeAgo = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const HealthDashboard = () => {
  const { projects, checkHealthStatus, isCheckingHealth } = useProjects();

  const deployedProjects = projects.filter(p => p.liveUrl);
  
  const healthyCount = deployedProjects.filter(p => p.deploymentStatus === 'Live').length;
  const downCount = deployedProjects.filter(p => p.deploymentStatus === 'Unavailable').length;
  const unknownCount = deployedProjects.filter(p => p.deploymentStatus === 'Unknown' || p.deploymentStatus === 'Checking').length;
  const notDeployedCount = projects.filter(p => !p.liveUrl).length;
  
  const downProjects = deployedProjects.filter(p => p.deploymentStatus === 'Unavailable');

  return (
    <div className="space-y-6 mt-12 mb-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif italic tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--color-accent)]" /> Project Health
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">Real-time status of your live deployments</p>
        </div>
        <button 
          onClick={checkHealthStatus} 
          disabled={isCheckingHealth}
          className="btn btn-secondary text-xs flex items-center gap-2 bg-[var(--color-card)] hover:bg-[var(--color-border)]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          {isCheckingHealth ? 'Checking...' : 'Run Health Check'}
        </button>
      </div>

      {downProjects.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex flex-col gap-2">
          {downProjects.map(p => (
            <div key={p._id} className="flex items-center gap-2 text-red-400 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              {p.name} is not responding.
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[var(--color-background)] border-[var(--color-border)] hover:transform-none cursor-default">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-white">{healthyCount}</div>
            <div className="text-xs text-[var(--color-muted-foreground)] uppercase mt-1">Healthy</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[var(--color-background)] border-[var(--color-border)] hover:transform-none cursor-default">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-6 w-6 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-white">{downCount}</div>
            <div className="text-xs text-[var(--color-muted-foreground)] uppercase mt-1">Down</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-background)] border-[var(--color-border)] hover:transform-none cursor-default">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mb-2" />
            <div className="text-2xl font-bold text-white">{unknownCount}</div>
            <div className="text-xs text-[var(--color-muted-foreground)] uppercase mt-1">Need Attention</div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-background)] border-[var(--color-border)] hover:transform-none cursor-default">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <HelpCircle className="h-6 w-6 text-gray-500 mb-2" />
            <div className="text-2xl font-bold text-white">{notDeployedCount}</div>
            <div className="text-xs text-[var(--color-muted-foreground)] uppercase mt-1">Not Deployed</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-background)] flex justify-between items-center">
          <h3 className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Project Status Log</h3>
          <span className="text-xs text-[var(--color-muted-foreground)]">{projects.length} Total</span>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
          {projects.map((project) => (
            <div key={project._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)]/40 transition-colors gap-4">
              <div className="font-medium text-white text-base md:w-1/3 truncate">
                {project.name}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:w-2/3 md:justify-end text-sm">
                <div className="flex items-center gap-2 min-w-[100px]">
                  {project.github?.url ? (
                    <><div className="h-2 w-2 rounded-full bg-green-500"></div> <span className="text-gray-300">GitHub Synced</span></>
                  ) : (
                    <><div className="h-2 w-2 rounded-full bg-gray-500"></div> <span className="text-gray-500">Unlinked</span></>
                  )}
                </div>
                
                <div className="flex items-center gap-2 min-w-[120px]">
                  {project.liveUrl ? (
                    project.deploymentStatus === 'Live' ? (
                      <><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> <span className="text-green-400">Web Live</span></>
                    ) : project.deploymentStatus === 'Unavailable' ? (
                      <><div className="h-2 w-2 rounded-full bg-red-500"></div> <span className="text-red-400">Web Down</span></>
                    ) : (
                      <><div className="h-2 w-2 rounded-full bg-amber-500"></div> <span className="text-amber-400">Web Unknown</span></>
                    )
                  ) : (
                    <><div className="h-2 w-2 rounded-full bg-gray-500"></div> <span className="text-gray-500">Not Deployed</span></>
                  )}
                </div>

                <div className="text-[var(--color-muted-foreground)] text-xs font-mono min-w-[80px] text-right">
                  {timeAgo(project.lastDeploymentCheck)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
