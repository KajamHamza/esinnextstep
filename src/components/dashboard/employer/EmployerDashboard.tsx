
import { AccountBanner } from "./AccountBanner";
import { QuickStats } from "./QuickStats";
import { NextSteps } from "./NextSteps";

interface EmployerDashboardProps {
  account_type: 'free' | 'premium';
}

export const EmployerDashboard = ({ account_type }: EmployerDashboardProps) => {
  return (
    <div className="space-y-6">
      <AccountBanner accountType={account_type} />
      <QuickStats />
      <NextSteps />
    </div>
  );
};
