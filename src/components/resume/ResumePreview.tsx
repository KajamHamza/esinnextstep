
import { memo } from "react";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
  resume: ResumeData;
}

export const ResumePreview = memo(({ resume }: ResumePreviewProps) => {
  return (
    <div className="border rounded-md p-4 bg-white text-black text-xs overflow-auto max-h-[600px] shadow-inner">
      {/* Header - Name and Contact */}
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold">{resume.basic_info?.name || 'Your Name'}</h1>
        <div className="text-[10px] space-x-1">
          {resume.basic_info?.email && <span>{resume.basic_info.email}</span>}
          {resume.basic_info?.email && resume.basic_info?.phone && <span>•</span>}
          {resume.basic_info?.phone && <span>{resume.basic_info.phone}</span>}
          {(resume.basic_info?.email || resume.basic_info?.phone) && resume.basic_info?.location && <span>•</span>}
          {resume.basic_info?.location && <span>{resume.basic_info.location}</span>}
        </div>
        {(resume.basic_info?.website || resume.basic_info?.linkedin) && (
          <div className="text-[10px] space-x-1">
            {resume.basic_info?.website && <span>{resume.basic_info.website}</span>}
            {resume.basic_info?.website && resume.basic_info?.linkedin && <span>•</span>}
            {resume.basic_info?.linkedin && <span>{resume.basic_info.linkedin}</span>}
          </div>
        )}
      </div>
      
      {/* Experience Section */}
      {resume.experience && resume.experience.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold border-b border-gray-300 mb-1 pb-1">EXPERIENCE</h2>
          {resume.experience.map((exp, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{exp.position}</span>
                <span className="text-[10px]">
                  {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="italic text-[10px]">{exp.company}</span>
                {exp.location && <span className="text-[10px]">{exp.location}</span>}
              </div>
              <p className="text-[10px] mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Education Section */}
      {resume.education && resume.education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold border-b border-gray-300 mb-1 pb-1">EDUCATION</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{edu.institution}</span>
                <span className="text-[10px]">
                  {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {edu.current ? 'Present' : edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="italic text-[10px]">{edu.degree} in {edu.field}</span>
                {edu.location && <span className="text-[10px]">{edu.location}</span>}
              </div>
              {edu.gpa && <p className="text-[10px] mt-1">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Skills Section */}
      {(resume.skills?.technical.length > 0 || resume.skills?.soft.length > 0) && (
        <div className="mb-3">
          <h2 className="text-xs font-bold border-b border-gray-300 mb-1 pb-1">SKILLS</h2>
          {resume.skills.technical.length > 0 && (
            <div className="text-[10px] mb-1">
              <span className="font-semibold">Technical Skills: </span>
              {resume.skills.technical.join(', ')}
            </div>
          )}
          {resume.skills.soft.length > 0 && (
            <div className="text-[10px]">
              <span className="font-semibold">Soft Skills: </span>
              {resume.skills.soft.join(', ')}
            </div>
          )}
          {resume.skills.languages.length > 0 && (
            <div className="text-[10px]">
              <span className="font-semibold">Languages: </span>
              {resume.skills.languages.join(', ')}
              </div>
          )}
          {resume.skills.certifications.length > 0 && (
            <div className="text-[10px]">
              <span className="font-semibold">Certifications: </span>
              {resume.skills.certifications.join(', ')}
              </div>
          )}
        </div>
      )}
      
      {/* Projects Section */}
      {resume.projects && resume.projects.length > 0 && (
        <div>
          <h2 className="text-xs font-bold border-b border-gray-300 mb-1 pb-1">PROJECTS</h2>
          {resume.projects.map((project, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{project.title}</span>
                <span className="text-[10px]">{project.technologies.join(', ')}</span>
              </div>
              <p className="text-[10px] mt-1">{project.description}</p>
              {(project.link || project.github_link) && (
                <div className="text-[10px] mt-1">
                  {project.github_link && <span>GitHub: {project.github_link}</span>}
                  {project.github_link && project.link && <span> • </span>}
                  {project.link && <span>Link: {project.link}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";
