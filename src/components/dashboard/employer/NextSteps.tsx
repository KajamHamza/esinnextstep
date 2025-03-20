
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NextSteps = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
      <Card>
        <CardHeader>
          <CardTitle>Get Started with Hiring</CardTitle>
          <CardDescription>Complete these steps to start finding talent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Complete your company profile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add your company description, logo, and industry to help candidates learn about you.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">Update Profile</Button>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Post your first job</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create a job posting to start receiving applications from qualified candidates.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">Post a Job</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
