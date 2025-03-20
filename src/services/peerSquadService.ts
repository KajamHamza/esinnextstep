
import { supabase } from "@/integrations/supabase/client";
import { PeerSquad, SquadMember } from "@/types/database";

export interface JoinSquadOptions {
  squadId: string;
  studentId: string;
}

export const peerSquadService = {
  async getSquads(): Promise<PeerSquad[]> {
    try {
      const { data, error } = await supabase
        .from('peer_squads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const squadsWithMembers = await Promise.all(
        data.map(async (squad) => {
          const { data: membersData } = await supabase
            .from('peer_squad_members')
            .select(`
              id,
              student_id,
              role,
              joined_at,
              peer_squad_id
            `)
            .eq('peer_squad_id', squad.id);
            
          // Get member profiles separately to avoid the type error
          const members: SquadMember[] = [];
          
          if (membersData) {
            for (const member of membersData) {
              const { data: profileData } = await supabase
                .from('student_profiles')
                .select('first_name, last_name, profile_image_url')
                .eq('id', member.student_id)
                .single();
                
              members.push({
                id: member.id,
                peer_squad_id: member.peer_squad_id,
                student_id: member.student_id,
                role: member.role,
                joined_at: member.joined_at,
                student: {
                  first_name: profileData?.first_name || '',
                  last_name: profileData?.last_name || '',
                  profile_image_url: profileData?.profile_image_url || ''
                }
              });
            }
          }
          
          return {
            ...squad,
            members
          } as PeerSquad;
        })
      );
      
      return squadsWithMembers;
    } catch (error) {
      console.error('Error fetching peer squads:', error);
      return [];
    }
  },
  
  async getSquadById(squadId: string): Promise<PeerSquad | null> {
    try {
      const { data, error } = await supabase
        .from('peer_squads')
        .select('*')
        .eq('id', squadId)
        .single();

      if (error) throw error;
      
      // Get member profiles separately to avoid the type error
      const { data: membersData } = await supabase
        .from('peer_squad_members')
        .select(`
          id,
          student_id,
          role,
          joined_at,
          peer_squad_id
        `)
        .eq('peer_squad_id', squadId);
      
      const members: SquadMember[] = [];
      
      if (membersData) {
        for (const member of membersData) {
          const { data: profileData } = await supabase
            .from('student_profiles')
            .select('first_name, last_name, profile_image_url')
            .eq('id', member.student_id)
            .single();
            
          members.push({
            id: member.id,
            peer_squad_id: member.peer_squad_id,
            student_id: member.student_id,
            role: member.role,
            joined_at: member.joined_at,
            student: {
              first_name: profileData?.first_name || '',
              last_name: profileData?.last_name || '',
              profile_image_url: profileData?.profile_image_url || ''
            }
          });
        }
      }
        
      return {
        ...data,
        members
      } as PeerSquad;
    } catch (error) {
      console.error('Error fetching peer squad details:', error);
      return null;
    }
  },
  
  // Alias methods for PeerSquad.tsx compatibility
  getAllPeerSquads() {
    return this.getSquads();
  },
  
  getUserPeerSquads: async (): Promise<PeerSquad[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data: membershipData } = await supabase
        .from('peer_squad_members')
        .select('peer_squad_id')
        .eq('student_id', session.user.id);
      
      if (!membershipData || membershipData.length === 0) return [];
      
      const squadIds = membershipData.map(item => item.peer_squad_id);
      
      const { data: squadsData } = await supabase
        .from('peer_squads')
        .select('*')
        .in('id', squadIds);
      
      if (!squadsData) return [];
      
      const squadsWithMembers = await Promise.all(
        squadsData.map(async (squad) => {
          const { data: membersData } = await supabase
            .from('peer_squad_members')
            .select(`
              id,
              student_id,
              role,
              joined_at,
              peer_squad_id
            `)
            .eq('peer_squad_id', squad.id);
            
          // Get member profiles separately 
          const members: SquadMember[] = [];
          
          if (membersData) {
            for (const member of membersData) {
              const { data: profileData } = await supabase
                .from('student_profiles')
                .select('first_name, last_name, profile_image_url')
                .eq('id', member.student_id)
                .single();
                
              members.push({
                id: member.id,
                peer_squad_id: member.peer_squad_id,
                student_id: member.student_id,
                role: member.role,
                joined_at: member.joined_at,
                student: {
                  first_name: profileData?.first_name || '',
                  last_name: profileData?.last_name || '',
                  profile_image_url: profileData?.profile_image_url || ''
                }
              });
            }
          }
          
          return {
            ...squad,
            members
          } as PeerSquad;
        })
      );
      
      return squadsWithMembers;
    } catch (error) {
      console.error('Error fetching user peer squads:', error);
      return [];
    }
  },
  
  // Alias of createSquad for PeerSquad.tsx compatibility
  createPeerSquad(squad: Partial<PeerSquad>) {
    return this.createSquad(squad);
  },
  
  async createSquad(squad: Partial<PeerSquad>): Promise<PeerSquad | null> {
    try {
      const { data, error } = await supabase
        .from('peer_squads')
        .insert({
          name: squad.name,
          description: squad.description,
          skill_focus: squad.skill_focus,
          created_by: squad.created_by,
          max_members: squad.max_members || 5,
          status: 'active'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add creator as first member with admin role
      const { error: memberError } = await supabase
        .from('peer_squad_members')
        .insert({
          peer_squad_id: data.id,
          student_id: data.created_by,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      return {
        ...data,
        members: [{
          id: '',
          peer_squad_id: data.id,
          student_id: data.created_by,
          role: 'admin',
          joined_at: new Date().toISOString(),
          student: {
            first_name: '',
            last_name: '',
            profile_image_url: ''
          }
        }]
      };
    } catch (error) {
      console.error('Error creating peer squad:', error);
      return null;
    }
  },
  
  async joinSquad({ squadId, studentId }: JoinSquadOptions): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('peer_squad_members')
        .insert({
          peer_squad_id: squadId,
          student_id: studentId,
          role: 'member'
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error joining peer squad:', error);
      return false;
    }
  },
  
  async leaveSquad({ squadId, studentId }: JoinSquadOptions): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('peer_squad_members')
        .delete()
        .eq('peer_squad_id', squadId)
        .eq('student_id', studentId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving peer squad:', error);
      return false;
    }
  },
  
  async updateMemberRole(memberId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('peer_squad_members')
        .update({ role })
        .eq('id', memberId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  },
  
  async updateSquad(squadId: string, updates: Partial<PeerSquad>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('peer_squads')
        .update({
          name: updates.name,
          description: updates.description,
          skill_focus: updates.skill_focus,
          max_members: updates.max_members,
          status: updates.status
        })
        .eq('id', squadId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating peer squad:', error);
      return false;
    }
  }
};
