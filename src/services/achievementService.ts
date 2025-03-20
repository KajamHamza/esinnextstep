
import { supabase } from "@/integrations/supabase/client";

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  badge_image_url: string | null;
  type: string;
  xp_awarded: number;
  earned_at: string;
  user_id: string;
}

export const achievementService = {
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },
  
  async getAchievementById(achievementId: string): Promise<Achievement | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching achievement details:', error);
      return null;
    }
  }
};
