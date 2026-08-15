import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, GitBranch as Github, ExternalLink, Calendar, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/ProjectModal';
import { useProjects } from '../context/ProjectContext';

const Projects = () => {
  const { projects, loading, refreshProjects } = useProjects();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.customDescription || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight mb-2">Projects</h1>
          <p className="text-[var(--color-muted-foreground)]">Manage and filter your entire repository vault.</p>
        </div>
        
        <div className="flex gap-4">
          <Link to="/github-sync" className="btn btn-primary inline-flex gap-2">
            <Github className="h-4 w-4" /> Sync GitHub
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-outline inline-flex gap-2">
            + New Project
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
          <Input 
            placeholder="Search by name, description, tags..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          <select 
            className="input w-48 appearance-none bg-[var(--color-card)]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Website">Website</option>
            <option value="Web App">Web App</option>
            <option value="Game">Game</option>
            <option value="College Project">College Project</option>
            <option value="Client Project">Client Project</option>
            <option value="Personal Project">Personal Project</option>
            <option value="Experiment">Experiment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-xl bg-[var(--color-muted)] animate-pulse" />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[var(--color-border)] rounded-xl p-12 text-center">
          <Code2 className="h-12 w-12 text-[var(--color-muted-foreground)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-[var(--color-muted-foreground)] mb-6 max-w-md">We couldn't find any projects matching your current filters or search terms.</p>
          <button onClick={() => { setSearch(''); setFilterType('All'); }} className="btn btn-secondary">Clear Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className="block group">
              <Card className="h-full flex flex-col card-hoverable">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-bold truncate group-hover:text-[var(--color-accent)] transition-colors">{project.name}</CardTitle>
                    {project.deploymentStatus === 'Live' ? (
                       <Badge variant="success" className="shrink-0 ml-2">Live</Badge>
                    ) : (
                       <Badge variant={project.status === 'Completed' ? 'success' : 'outline'} className="shrink-0 ml-2">{project.status}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-4 line-clamp-2">
                    {project.customDescription || project.github?.description || 'No description provided.'}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies?.slice(0, 4).map(tech => (
                        <span key={tech} className="px-1.5 py-0.5 rounded-sm bg-[var(--color-muted)] text-[var(--color-foreground)] text-[10px] font-mono uppercase">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)] font-mono">
                      {project.updatedAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                      {project.github?.language && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                          {project.github.language}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaved={refreshProjects} 
      />
    </div>
  );
};

export default Projects;
