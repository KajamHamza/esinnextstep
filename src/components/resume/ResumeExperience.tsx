
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Experience = {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  location?: string;
  description: string;
  achievements?: string[];
};

interface ResumeExperienceProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const ResumeExperience = ({ data, onChange }: ResumeExperienceProps) => {
  const [experience, setExperience] = useState<Experience[]>(data.length ? data : []);

  const addExperience = () => {
    const newExperience: Experience = {
      id: uuidv4(),
      company: '',
      position: '',
      start_date: '',
      description: '',
    };
    
    setExperience([...experience, newExperience]);
    onChange([...experience, newExperience]);
  };

  const removeExperience = (id: string) => {
    const updated = experience.filter(exp => exp.id !== id);
    setExperience(updated);
    onChange(updated);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const updated = experience.map(exp => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    
    setExperience(updated);
    onChange(updated);
  };

  const handleCurrentChange = (id: string, checked: boolean) => {
    const updated = experience.map(exp => {
      if (exp.id === id) {
        return { 
          ...exp, 
          current: checked,
          end_date: checked ? undefined : exp.end_date
        };
      }
      return exp;
    });
    
    setExperience(updated);
    onChange(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Work Experience</h2>
        <Button onClick={addExperience} variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Click "Add Experience" to add your work experience
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((exp) => (
            <Card key={exp.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      placeholder="Job Title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location (Optional)</Label>
                    <Input
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>End Date</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!!exp.current}
                          onCheckedChange={(checked) => handleCurrentChange(exp.id, checked)}
                        />
                        <Label>Current</Label>
                      </div>
                    </div>
                    <Input
                      type="date"
                      value={exp.end_date || ''}
                      onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)}
                      disabled={!!exp.current}
                      required={!exp.current}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    placeholder="Describe your responsibilities and achievements at this position..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
