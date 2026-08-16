import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Server, Activity, Briefcase, ExternalLink, GitBranch as Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

import HealthDashboard from '../components/ui/HealthDashboard';

const Dashboard = () => {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-mono font-bold tracking-tight">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const liveProjects = projects.filter(p => p.liveUrl).length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif italic tracking-tight mb-2">Vault Overview</h1>
        <p className="text-[var(--color-muted-foreground)]">Your personal project management center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:transform-none hover:shadow-sm cursor-default">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif font-bold text-white mt-2">{projects.length}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:transform-none hover:shadow-sm cursor-default">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Live Deployments</CardTitle>
            <Activity className="h-4 w-4 text-[var(--color-accent)]" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif font-bold text-[var(--color-accent)] mt-2">{liveProjects}</div>
          </CardContent>
        </Card>

        <Card className="hover:transform-none hover:shadow-sm cursor-default">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">Completed</CardTitle>
            <Server className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif font-bold text-white mt-2">{completedProjects}</div>
          </CardContent>
        </Card>
      </div>

      <HealthDashboard />

      <div className="mt-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-serif italic tracking-tight">Featured Projects</h2>
          <Link to="/projects" className="text-sm text-[var(--color-accent)] hover:underline">View All Projects &rarr;</Link>
        </div>
        
        {featuredProjects.length === 0 ? (
          <div className="border border-dashed border-[var(--color-border)] rounded-xl p-12 text-center text-[var(--color-muted-foreground)]">
            No featured projects yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
            {featuredProjects.map(project => (
              <Card key={project._id} className="flex flex-col card-hoverable">
                <Link to={`/projects/${project._id}`} className="flex-1 flex flex-col group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold truncate group-hover:text-[var(--color-accent)] transition-colors">{project.name}</CardTitle>
                      {project.deploymentStatus === 'Live' ? <Badge variant="success">Live</Badge> : <Badge variant="success">Completed</Badge>}
                    </div>
                    <div className="text-sm text-[var(--color-muted-foreground)]">{project.type}</div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {project.customDescription || project.github?.description ? (
                      <p className="text-sm mb-4 line-clamp-3 text-[var(--color-foreground)]">
                        {project.customDescription || project.github.description}
                      </p>
                    ) : (
                      <p className="text-sm mb-4 italic text-[var(--color-muted-foreground)]">
                        No description provided.
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-auto pb-4">
                      {project.technologies?.slice(0, 3).map(tech => (
                        <Badge key={tech} variant="secondary" className="font-mono text-[10px] uppercase">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies?.length > 3 && (
                        <Badge variant="secondary" className="font-mono text-[10px]">+{project.technologies.length - 3}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Link>
                <div className="p-4 bg-[var(--color-muted)]/20 rounded-b-xl flex flex-wrap gap-2 justify-between items-center mt-auto border-t border-[var(--color-border)]/50">
                  {project.github?.url && (
                    <a href={project.github.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-white transition-colors bg-[var(--color-background)] px-3 py-1.5 rounded-md border border-[var(--color-border)]">
                      <Github className="h-3.5 w-3.5" /> Code
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-on-accent)] bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 transition-colors px-3 py-1.5 rounded-md">
                      <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
