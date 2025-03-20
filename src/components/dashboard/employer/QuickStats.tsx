
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const QuickStats = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0/3</div>
          <div className="mt-2 text-xs text-gray-500">Start posting jobs to attract candidates</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <div className="mt-2 text-xs text-gray-500">Post your first job to receive applications</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">25%</div>
          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-1/4"></div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Complete your company profile to attract candidates</div>
        </CardContent>
      </Card>
    </div>
  );
};
