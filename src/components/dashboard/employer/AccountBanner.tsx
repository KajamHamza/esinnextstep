
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccountBannerProps {
  accountType: 'free' | 'premium';
}

export const AccountBanner = ({ accountType }: AccountBannerProps) => {
  if (accountType === 'premium') {
    return (
      <Card className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-1">Pro Account</h3>
          <p>You have access to all premium employer features</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-1">Standard Plan</h3>
          <p>Upgrade to Pro for advanced candidate filtering and analytics</p>
        </div>
        <Button variant="secondary" className="shrink-0">
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
};
