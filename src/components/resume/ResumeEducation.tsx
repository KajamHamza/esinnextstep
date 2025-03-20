
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  location?: string;
  gpa?: string;
  achievements?: string[];
};

interface ResumeEducationProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const ResumeEducation = ({ data, onChange }: ResumeEducationProps) => {
  const [education, setEducation] = useState<Education[]>(data.length ? data : []);

  const addEducation = () => {
    const newEducation: Education = {
      id: uuidv4(),
      institution: '',
      degree: '',
      field: '',
      start_date: '',
    };
    
    setEducation([...education, newEducation]);
    onChange([...education, newEducation]);
  };

  const removeEducation = (id: string) => {
    const updated = education.filter(edu => edu.id !== id);
    setEducation(updated);
    onChange(updated);
  };

  const updateEducation = (id: string, field: string, value: any) => {
    const updated = education.map(edu => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    
    setEducation(updated);
    onChange(updated);
  };

  const handleCurrentChange = (id: string, checked: boolean) => {
    const updated = education.map(edu => {
      if (edu.id === id) {
        return { 
          ...edu, 
          current: checked,
          end_date: checked ? undefined : edu.end_date
        };
      }
      return edu;
    });
    
    setEducation(updated);
    onChange(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Education</h2>
        <Button onClick={addEducation} variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Click "Add Education" to add your education history
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <Card key={edu.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      placeholder="University name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location (Optional)</Label>
                    <Input
                      value={edu.location || ''}
                      onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={edu.start_date}
                      onChange={(e) => updateEducation(edu.id, 'start_date', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>End Date</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!!edu.current}
                          onCheckedChange={(checked) => handleCurrentChange(edu.id, checked)}
                        />
                        <Label>Current</Label>
                      </div>
                    </div>
                    <Input
                      type="date"
                      value={edu.end_date || ''}
                      onChange={(e) => updateEducation(edu.id, 'end_date', e.target.value)}
                      disabled={!!edu.current}
                      required={!edu.current}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>GPA (Optional)</Label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="3.8"
                    />
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
