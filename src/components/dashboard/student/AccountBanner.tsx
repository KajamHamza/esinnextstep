
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";

interface AccountBannerProps {
  accountType: 'free' | 'premium';
}

export const AccountBanner = ({ accountType }: AccountBannerProps) => {
  if (accountType === 'premium') {
    return (
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-300" />
            <div>
              <h3 className="font-bold">Premium Account</h3>
              <p className="text-sm text-purple-100">Enjoy exclusive features and priority access</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Premium Active
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
      <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Crown className="h-6 w-6 mr-2 text-purple-600" />
          <div>
            <h3 className="font-bold">Free Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Upgrade to access premium features</p>
          </div>
        </div>
        <UpgradeModal 
          trigger={
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
              Upgrade to Premium
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
};
