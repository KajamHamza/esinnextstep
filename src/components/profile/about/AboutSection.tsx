
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { EducationSection } from './EducationSection';
import { SkillsSection } from './SkillsSection';
import { CareerGoalsSection } from './CareerGoalsSection';
import { SocialLinksEditor } from './SocialLinksEditor';
import { StudentProfileData } from "@/types/profile";

interface AboutSectionProps {
  studentProfile: StudentProfileData;
  editing: boolean;
  isCurrentUser: boolean;
  editingStudentProfile: StudentProfileData | null;
  setEditingStudentProfile: (profile: StudentProfileData | null) => void;
}

export const AboutSection = ({
  studentProfile,
  editing,
  isCurrentUser,
  editingStudentProfile,
  setEditingStudentProfile
}: AboutSectionProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Education & Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EducationSection 
            studentProfile={studentProfile}
            editing={editing}
            isCurrentUser={isCurrentUser}
            editingStudentProfile={editingStudentProfile}
            setEditingStudentProfile={setEditingStudentProfile}
          />
          
          <SkillsSection 
            studentProfile={studentProfile}
            editing={editing}
            isCurrentUser={isCurrentUser}
            editingStudentProfile={editingStudentProfile}
            setEditingStudentProfile={setEditingStudentProfile}
          />
          
          <CareerGoalsSection 
            studentProfile={studentProfile}
            editing={editing}
            isCurrentUser={isCurrentUser}
            editingStudentProfile={editingStudentProfile}
            setEditingStudentProfile={setEditingStudentProfile}
          />
          
          {editing && isCurrentUser && (
            <SocialLinksEditor 
              editingStudentProfile={editingStudentProfile}
              setEditingStudentProfile={setEditingStudentProfile}
            />
          )}
        </CardContent>
      </Card>
      
      {/* GitHub Projects Section */}
      {studentProfile.github_projects && studentProfile.github_projects.length > 0 && (
        <GithubProjectsSection projects={studentProfile.github_projects} />
      )}
    </>
  );
};

interface GithubProject {
  name: string;
  description?: string;
  url: string;
  stars?: number;
  forks?: number;
}

interface GithubProjectsSectionProps {
  projects: GithubProject[];
}

const GithubProjectsSection = ({ projects }: GithubProjectsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Projects</CardTitle>
        <CardContent className="text-sm text-muted-foreground">Projects fetched from GitHub</CardContent>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, index) => (
          <GithubProjectCard key={index} project={project} />
        ))}
      </CardContent>
    </Card>
  );
};

interface GithubProjectCardProps {
  project: GithubProject;
}

import { Star, GitBranch } from 'lucide-react';

const GithubProjectCard = ({ project }: GithubProjectCardProps) => {
  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{project.name}</h3>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="flex items-center">
            <Star className="w-4 h-4 mr-1" /> {project.stars || 0}
          </span>
          <span className="flex items-center">
            <GitBranch className="w-4 h-4 mr-1" /> {project.forks || 0}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <a 
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};
