import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get('/api/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects context', error);
    } finally {
      setLoading(false);
    }
  };

  const checkHealthStatus = async () => {
    if (!user) return;
    setIsCheckingHealth(true);
    try {
      const { data } = await axios.post('/api/projects/health-sync');
      setProjects(data); // update with the refreshed data
    } catch (error) {
      console.error('Failed to sync health status', error);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const refreshProjects = async () => {
    await fetchProjects();
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, refreshProjects, checkHealthStatus, isCheckingHealth }}>
      {children}
    </ProjectContext.Provider>
  );
};
