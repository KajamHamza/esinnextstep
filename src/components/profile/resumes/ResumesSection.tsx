
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Edit,
  Calendar,
  Download,
  ArrowRightLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ResumeData } from '@/types/resume';

interface ResumesSectionProps {
  resumes: ResumeData[];
}

export const ResumesSection = ({ resumes }: ResumesSectionProps) => {
  return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resumes</CardTitle>
            <CardDescription>Your resume collection</CardDescription>
          </div>
          <Link to="/resume-builder">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                    <ResumeCard key={resume.id} resume={resume} />
                ))}
              </div>
          ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">You haven't created any resumes yet.</p>
                <Link to="/resume-builder">
                  <Button className="mt-4">Create Your First Resume</Button>
                </Link>
              </div>
          )}
        </CardContent>
      </Card>
  );
};

interface ResumeCardProps {
  resume: ResumeData;
}

const ResumeCard = ({ resume }: ResumeCardProps) => {
  return (
      <div className="border p-4 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium flex items-center">
              {resume.title || 'Untitled Resume'}
              {resume.is_primary && (
                  <Badge variant="outline" className="ml-2">Primary</Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              General Resume
            </p>
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Updated {resume.updated_at ? formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true }) : 'N/A'}
            </div>
          </div>
          <div className="flex space-x-2">
            <Link to={`/resume-builder?id=${resume.id}`}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Edit Resume">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Download Resume">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Make Primary Resume">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
  );
};