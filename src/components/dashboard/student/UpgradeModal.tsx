
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, X, CreditCard, LifeBuoy, Book, Award, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  trigger: React.ReactNode;
}

export const UpgradeModal = ({ trigger }: UpgradeModalProps) => {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleUpgradeAccount = async () => {
    try {
      setProcessing(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to upgrade your account"
        });
        return;
      }
      
      // Update user account type using the RPC function
      const { error } = await supabase.rpc('update_account_type', {
        user_id: session.user.id,
        new_account_type: 'premium'
      });
      
      if (error) throw error;
      
      // Add premium user achievement
      await supabase
        .from('achievements')
        .insert({
          user_id: session.user.id,
          name: "Premium Member",
          description: "Upgraded to a premium account",
          type: "membership",
          xp_awarded: 50
        });
      
      // Award XP for upgrading
      await supabase.rpc('award_xp', {
        user_id: session.user.id,
        xp_amount: 50
      });
      
      setOpen(false);
      
      toast({
        title: "Account Upgraded!",
        description: "You now have access to premium features. Enjoy!",
      });
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error("Error upgrading account:", error);
      toast({
        variant: "destructive",
        title: "Upgrade Failed",
        description: error.message || "Could not upgrade your account. Please try again."
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent pb-2">
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock all features and accelerate your career growth
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 p-4 rounded-lg">
            <div className="flex-1 border-r border-purple-200 dark:border-purple-700 pr-4">
              <h3 className="font-bold mb-2">Free</h3>
              <p className="text-2xl font-bold mb-4">$0 <span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">Basic job applications</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">Limited learning paths</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                  <span className="text-sm text-muted-foreground">Premium mentors</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                  <span className="text-sm text-muted-foreground">Enhanced profile visibility</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                  <span className="text-sm text-muted-foreground">Priority application review</span>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 pl-4">
              <h3 className="font-bold mb-2 text-purple-700 dark:text-purple-400">Premium</h3>
              <p className="text-2xl font-bold mb-4">$15 <span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">Unlimited job applications</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">All learning paths</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">Access to all mentors</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">Enhanced profile visibility</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm">Priority application review</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <CreditCard className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h4 className="text-sm font-medium">Cancel Anytime</h4>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <LifeBuoy className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h4 className="text-sm font-medium">Priority Support</h4>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Book className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h4 className="text-sm font-medium">Premium Content</h4>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h4 className="text-sm font-medium">Exclusive Badges</h4>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Maybe Later
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={handleUpgradeAccount}
            disabled={processing}
          >
            {processing ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
