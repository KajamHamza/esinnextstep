export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_image_url: string | null
          description: string | null
          earned_at: string
          id: string
          name: string
          type: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          badge_image_url?: string | null
          description?: string | null
          earned_at?: string
          id?: string
          name: string
          type: string
          user_id: string
          xp_awarded: number
        }
        Update: {
          badge_image_url?: string | null
          description?: string | null
          earned_at?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          company_benefits: string[] | null
          company_culture: string | null
          company_description: string | null
          company_location: string | null
          company_name: string
          company_size: string | null
          company_values: string[] | null
          contact_email: string | null
          contact_phone: string | null
          id: string
          industry: string | null
          logo_url: string | null
          social_links: Json | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          company_benefits?: string[] | null
          company_culture?: string | null
          company_description?: string | null
          company_location?: string | null
          company_name: string
          company_size?: string | null
          company_values?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          id: string
          industry?: string | null
          logo_url?: string | null
          social_links?: Json | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          company_benefits?: string[] | null
          company_culture?: string | null
          company_description?: string | null
          company_location?: string | null
          company_name?: string
          company_size?: string | null
          company_values?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          social_links?: Json | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          resume_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          resume_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          resume_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          description: string
          education_level: string | null
          employer_id: string | null
          experience_level: string | null
          expires_at: string | null
          id: string
          job_type: string
          location: string
          posted_at: string
          requirements: string[]
          responsibilities: string[]
          salary_range: string | null
          skills_required: string[]
          status: string
          title: string
        }
        Insert: {
          company: string
          description: string
          education_level?: string | null
          employer_id?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          job_type: string
          location: string
          posted_at?: string
          requirements?: string[]
          responsibilities?: string[]
          salary_range?: string | null
          skills_required?: string[]
          status?: string
          title: string
        }
        Update: {
          company?: string
          description?: string
          education_level?: string | null
          employer_id?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          job_type?: string
          location?: string
          posted_at?: string
          requirements?: string[]
          responsibilities?: string[]
          salary_range?: string | null
          skills_required?: string[]
          status?: string
          title?: string
        }
        Relationships: []
      }
      learning_enrollments: {
        Row: {
          enrolled_at: string
          id: string
          learning_path_id: string
          student_id: string
        }
        Insert: {
          enrolled_at?: string
          id?: string
          learning_path_id: string
          student_id: string
        }
        Update: {
          enrolled_at?: string
          id?: string
          learning_path_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_enrollments_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          learning_path_id: string
          order_number: number
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          learning_path_id: string
          order_number: number
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          learning_path_id?: string
          order_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          total_modules: number
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          total_modules?: number
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          total_modules?: number
          xp_reward?: number
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed_at: string
          id: string
          learning_path_id: string
          module_id: string
          student_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          learning_path_id: string
          module_id: string
          student_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          learning_path_id?: string
          module_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_bookings: {
        Row: {
          booked_at: string
          id: string
          mentor_id: string
          status: string
          student_id: string
          time_slot_id: string
        }
        Insert: {
          booked_at?: string
          id?: string
          mentor_id: string
          status?: string
          student_id: string
          time_slot_id: string
        }
        Update: {
          booked_at?: string
          id?: string
          mentor_id?: string
          status?: string
          student_id?: string
          time_slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: true
            referencedRelation: "mentor_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_time_slots: {
        Row: {
          created_at: string
          day: string
          end_time: string
          id: string
          mentor_id: string
          start_time: string
          status: string
        }
        Insert: {
          created_at?: string
          day: string
          end_time: string
          id?: string
          mentor_id: string
          start_time: string
          status?: string
        }
        Update: {
          created_at?: string
          day?: string
          end_time?: string
          id?: string
          mentor_id?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_time_slots_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          premium_only: boolean | null
          role: string
          specialty: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          premium_only?: boolean | null
          role: string
          specialty?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          premium_only?: boolean | null
          role?: string
          specialty?: string | null
        }
        Relationships: []
      }
      peer_squad_activities: {
        Row: {
          created_at: string
          creator_id: string
          description: string
          due_date: string | null
          id: string
          link: string | null
          squad_id: string
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description: string
          due_date?: string | null
          id?: string
          link?: string | null
          squad_id: string
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string
          due_date?: string | null
          id?: string
          link?: string | null
          squad_id?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_squad_activities_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "peer_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_squad_activity_comments: {
        Row: {
          activity_id: string
          author_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          activity_id: string
          author_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          activity_id?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_squad_activity_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "peer_squad_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_squad_members: {
        Row: {
          id: string
          joined_at: string
          peer_squad_id: string
          role: string
          student_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          peer_squad_id: string
          role?: string
          student_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          peer_squad_id?: string
          role?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_squad_members_peer_squad_id_fkey"
            columns: ["peer_squad_id"]
            isOneToOne: false
            referencedRelation: "peer_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_squads: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          max_members: number
          name: string
          skill_focus: string[]
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          max_members?: number
          name: string
          skill_focus: string[]
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          max_members?: number
          name?: string
          skill_focus?: string[]
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          created_at: string
          id: string
          onboarding_completed: boolean | null
          role: string
          updated_at: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          id: string
          onboarding_completed?: boolean | null
          role: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_primary: boolean | null
          name: string
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          is_primary?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_primary?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          career_goals: string[] | null
          education: string | null
          first_name: string | null
          github_projects: Json[] | null
          github_username: string | null
          id: string
          last_name: string | null
          level: number
          linkedin_url: string | null
          profile_image_url: string | null
          resume_url: string | null
          skills: string[] | null
          xp_points: number
        }
        Insert: {
          bio?: string | null
          career_goals?: string[] | null
          education?: string | null
          first_name?: string | null
          github_projects?: Json[] | null
          github_username?: string | null
          id: string
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          xp_points?: number
        }
        Update: {
          bio?: string | null
          career_goals?: string[] | null
          education?: string | null
          first_name?: string | null
          github_projects?: Json[] | null
          github_username?: string | null
          id?: string
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          xp_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: {
          user_id: string
          xp_amount: number
        }
        Returns: undefined
      }
      update_account_type: {
        Args: {
          user_id: string
          new_account_type: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
