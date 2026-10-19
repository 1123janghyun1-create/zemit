export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          handle: string;
          avatar_url: string | null;
          bio: string | null;
          role: string | null;
          github_url: string | null;
          twitter_url: string | null;
          website_url: string | null;
          is_starting_member: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          handle: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          website_url?: string | null;
          is_starting_member?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          handle?: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string | null;
          github_url?: string | null;
          twitter_url?: string | null;
          website_url?: string | null;
          is_starting_member?: boolean;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          tagline: string;
          description: string;
          status: string;
          logo_url: string;
          cover_url: string;
          screenshots: string[];
          website_url: string;
          github_url: string | null;
          tags: string[];
          likes_count: number;
          views_count: number;
          comments_count: number;
          feedbacks_count: number;
          looking_for_team: boolean;
          looking_for_team_roles: string[] | null;
          looking_for_testers: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          tagline: string;
          description: string;
          status?: string;
          logo_url: string;
          cover_url: string;
          screenshots?: string[];
          website_url: string;
          github_url?: string | null;
          tags?: string[];
          likes_count?: number;
          views_count?: number;
          comments_count?: number;
          feedbacks_count?: number;
          looking_for_team?: boolean;
          looking_for_team_roles?: string[] | null;
          looking_for_testers?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          tagline?: string;
          description?: string;
          status?: string;
          logo_url?: string;
          cover_url?: string;
          screenshots?: string[];
          website_url?: string;
          github_url?: string | null;
          tags?: string[];
          looking_for_team?: boolean;
          looking_for_team_roles?: string[] | null;
          looking_for_testers?: boolean;
          updated_at?: string;
        };
      };
      feedbacks: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          upvotes: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          upvotes?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
          upvotes?: number;
        };
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          content: string;
          likes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          content: string;
          likes?: number;
          created_at?: string;
        };
      };
      project_updates: {
        Row: {
          id: string;
          project_id: string;
          version: string;
          title: string;
          content: string;
          likes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version: string;
          title: string;
          content: string;
          likes?: number;
          created_at?: string;
        };
      };
      project_clicks: {
        Row: {
          id: string;
          project_id: string;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          referrer?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

