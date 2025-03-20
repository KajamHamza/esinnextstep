
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

type Skills = {
  technical: string[];
  soft: string[];
  languages?: string[];
  certifications?: string[];
};

interface ResumeSkillsProps {
  data: Skills;
  onChange: (data: Skills) => void;
}

export const ResumeSkills = ({ data, onChange }: ResumeSkillsProps) => {
  const [skills, setSkills] = useState<Skills>(data);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const handleAddSkill = (type: keyof Skills, skill: string) => {
    if (!skill.trim()) return;

    const updatedSkills = {
      ...skills,
      [type]: [...skills[type], skill.trim()]
    };

    setSkills(updatedSkills);
    onChange(updatedSkills);

    // Reset the input field
    switch (type) {
      case 'technical':
        setNewTechnicalSkill("");
        break;
      case 'soft':
        setNewSoftSkill("");
        break;
      case 'languages':
        setNewLanguage("");
        break;
      case 'certifications':
        setNewCertification("");
        break;
    }
  };

  const handleRemoveSkill = (type: keyof Skills, index: number) => {
    const updatedSkills = {
      ...skills,
      [type]: skills[type].filter((_, i) => i !== index)
    };

    setSkills(updatedSkills);
    onChange(updatedSkills);
  };

  const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      type: keyof Skills,
      value: string
  ) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      handleAddSkill(type, value);
    }
  };

  return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Skills</h2>

        {/* Technical Skills */}
        <div>
          <Label className="text-base mb-2">Technical Skills</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.technical.map((skill, index) => (
                <div
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="mr-1">{skill}</span>
                  <button
                      onClick={() => handleRemoveSkill('technical', index)}
                      className="text-slate-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            ))}
          </div>
          <div className="flex">
            <Input
                value={newTechnicalSkill}
                onChange={(e) => setNewTechnicalSkill(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'technical', newTechnicalSkill)}
                placeholder="Add a technical skill (e.g., React, JavaScript, AWS)"
                className="mr-2"
            />
            <Button
                type="button"
                onClick={() => handleAddSkill('technical', newTechnicalSkill)}
                disabled={!newTechnicalSkill.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <Label className="text-base mb-2">Soft Skills</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.soft.map((skill, index) => (
                <div
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="mr-1">{skill}</span>
                  <button
                      onClick={() => handleRemoveSkill('soft', index)}
                      className="text-slate-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            ))}
          </div>
          <div className="flex">
            <Input
                value={newSoftSkill}
                onChange={(e) => setNewSoftSkill(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'soft', newSoftSkill)}
                placeholder="Add a soft skill (e.g., Communication, Leadership, Problem-solving)"
                className="mr-2"
            />
            <Button
                type="button"
                onClick={() => handleAddSkill('soft', newSoftSkill)}
                disabled={!newSoftSkill.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Languages */}
        <div>
          <Label className="text-base mb-2">Languages (Optional)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.languages?.map((language, index) => (
                <div
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="mr-1">{language}</span>
                  <button
                      onClick={() => handleRemoveSkill('languages', index)}
                      className="text-slate-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            ))}
          </div>
          <div className="flex">
            <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'languages', newLanguage)}
                placeholder="Add a language (e.g., English, Spanish, French)"
                className="mr-2"
            />
            <Button
                type="button"
                onClick={() => handleAddSkill('languages', newLanguage)}
                disabled={!newLanguage.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <Label className="text-base mb-2">Certifications (Optional)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.certifications?.map((cert, index) => (
                <div
                    key={index}
                    className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span className="mr-1">{cert}</span>
                  <button
                      onClick={() => handleRemoveSkill('certifications', index)}
                      className="text-slate-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
            ))}
          </div>
          <div className="flex">
            <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'certifications', newCertification)}
                placeholder="Add a certification (e.g., AWS Certified Solutions Architect, PMP)"
                className="mr-2"
            />
            <Button
                type="button"
                onClick={() => handleAddSkill('certifications', newCertification)}
                disabled={!newCertification.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
  );
};