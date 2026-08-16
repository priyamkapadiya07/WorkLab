import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, project = null, onSaved }) => {
  const isEdit = !!project;
  const [formData, setFormData] = useState({
    name: '',
    customDescription: '',
    liveUrl: '',
    deploymentProvider: '',
    type: 'Personal Project',
    status: 'In Development',
    technologies: '',
    tags: '',
    featured: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name || '',
        customDescription: project.customDescription || '',
        liveUrl: project.liveUrl || '',
        deploymentProvider: project.deploymentProvider || '',
        type: project.type || 'Personal Project',
        status: project.status || 'In Development',
        technologies: project.technologies?.join(', ') || '',
        tags: project.tags?.join(', ') || '',
        featured: project.featured || false,
        notes: project.notes || ''
      });
    } else if (!project && isOpen) {
      setFormData({
        name: '', customDescription: '', liveUrl: '', deploymentProvider: '',
        type: 'Personal Project', status: 'In Development',
        technologies: '', tags: '', featured: false, notes: ''
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await axios.put(`/api/projects/${project._id}`, payload);
      } else {
        await axios.post('/api/projects', {
          ...payload,
          slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)
        });
      }
      onSaved(payload);
      onClose();
    } catch (error) {
      console.error('Failed to save project', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-card)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--color-border)] shadow-xl relative">
        <div className="sticky top-0 bg-[var(--color-card)] z-10 border-b border-[var(--color-border)] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold font-mono text-white">{isEdit ? 'Edit Project metadata' : 'Add New Project'}</h2>
          <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Project Name *</label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Live URL</label>
              <Input type="url" value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} placeholder="https://..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Custom Description</label>
              <textarea 
                className="flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] min-h-[80px]"
                value={formData.customDescription} onChange={e => setFormData({...formData, customDescription: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Type</label>
              <select className="input appearance-none bg-[var(--color-background)]" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
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
            
            <div className="space-y-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Status</label>
              <select className="input appearance-none bg-[var(--color-background)]" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Planning">Planning</option>
                <option value="In Development">In Development</option>
                <option value="Completed">Completed</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Deployment Provider</label>
              <Input value={formData.deploymentProvider} onChange={e => setFormData({...formData, deploymentProvider: e.target.value})} placeholder="Vercel, Netlify..." />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Technologies (comma separated)</label>
              <Input value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} placeholder="React, Node.js, MongoDB" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono font-semibold text-[var(--color-muted-foreground)] text-xs uppercase">Notes (Personal)</label>
              <textarea 
                className="flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] min-h-[80px]"
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} 
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]" />
              <label htmlFor="featured" className="font-mono font-semibold text-[var(--color-foreground)] text-sm cursor-pointer">Mark as Featured Project</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Project'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
