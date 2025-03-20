
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from 'lucide-react';

interface MobileHeaderProps {
  onLogout: () => void;
  userRole?: string;
}

export const MobileHeader = ({ onLogout, userRole }: MobileHeaderProps) => {
  return (
      <header className="md:hidden bg-white dark:bg-slate-950 border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold">EsinNextStep</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
  );
};