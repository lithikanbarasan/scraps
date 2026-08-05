export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; display_name: string | null; first_name: string | null;
          last_name: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; display_name?: string | null; first_name?: string | null;
          last_name?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          display_name?: string | null; first_name?: string | null; last_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pantry_items: {
        Row: {
          id: string; user_id: string; name: string; quantity: number; unit: string;
          count: number; expires_on: string; estimated_value: number; emoji: string;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id?: string; name: string; quantity?: number; unit?: string;
          count?: number; expires_on: string; estimated_value?: number; emoji?: string;
          created_at?: string; updated_at?: string;
        };
        Update: {
          name?: string; quantity?: number; unit?: string; count?: number; expires_on?: string;
          estimated_value?: number; emoji?: string; updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
