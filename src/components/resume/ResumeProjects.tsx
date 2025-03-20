
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github_link?: string;
};

interface ResumeProjectsProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export const ResumeProjects = ({ data, onChange }: ResumeProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>(data.length ? data : []);
  const [newTech, setNewTech] = useState<{ [key: string]: string }>({});

  const addProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      title: '',
      description: '',
      technologies: [],
    };
    
    setProjects([...projects, newProject]);
    onChange([...projects, newProject]);
    setNewTech({ ...newTech, [newProject.id]: '' });
  };

  const removeProject = (id: string) => {
    const updated = projects.filter(project => project.id !== id);
    setProjects(updated);
    onChange(updated);
  };

  const updateProject = (id: string, field: string, value: any) => {
    const updated = projects.map(project => {
      if (project.id === id) {
        return { ...project, [field]: value };
      }
      return project;
    });
    
    setProjects(updated);
    onChange(updated);
  };

  const addTechnology = (projectId: string) => {
    if (!newTech[projectId]?.trim()) return;
    
    const updated = projects.map(project => {
      if (project.id === projectId) {
        return { 
          ...project, 
          technologies: [...project.technologies, newTech[projectId].trim()]
        };
      }
      return project;
    });
    
    setProjects(updated);
    onChange(updated);
    setNewTech({ ...newTech, [projectId]: '' });
  };

  const removeTechnology = (projectId: string, index: number) => {
    const updated = projects.map(project => {
      if (project.id === projectId) {
        return { 
          ...project, 
          technologies: project.technologies.filter((_, i) => i !== index)
        };
      }
      return project;
    });
    
    setProjects(updated);
    onChange(updated);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    projectId: string
  ) => {
    if (e.key === 'Enter' && newTech[projectId]?.trim()) {
      e.preventDefault();
      addTechnology(projectId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button onClick={addProject} variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Click "Add Project" to add your projects
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeProject(project.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Project Title</Label>
                    <Input
                      value={project.title}
                      onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                      placeholder="My Awesome Project"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>GitHub Link (Optional)</Label>
                    <Input
                      value={project.github_link || ''}
                      onChange={(e) => updateProject(project.id, 'github_link', e.target.value)}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label>Project Link (Optional)</Label>
                    <Input
                      value={project.link || ''}
                      onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                      placeholder="https://myproject.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <Label>Project Description</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    placeholder="Briefly describe what this project is about and your role in it..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.technologies.map((tech, index) => (
                      <div 
                        key={index} 
                        className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <span className="mr-1">{tech}</span>
                        <button 
                          onClick={() => removeTechnology(project.id, index)}
                          className="text-slate-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      value={newTech[project.id] || ''}
                      onChange={(e) => setNewTech({ ...newTech, [project.id]: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, project.id)}
                      placeholder="Add a technology (e.g., React, Node.js, Python)"
                      className="mr-2"
                    />
                    <Button 
                      type="button" 
                      onClick={() => addTechnology(project.id)}
                      disabled={!newTech[project.id]?.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
