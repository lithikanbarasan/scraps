export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; display_name: string | null; first_name: string | null;
          last_name: string | null; handle: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; display_name?: string | null; first_name?: string | null;
          last_name?: string | null; handle?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          display_name?: string | null; first_name?: string | null; last_name?: string | null; handle?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      exchange_requests: {
        Row: { id: string; listing_id: string; owner_id: string; requester_id: string; ingredient_name: string; ingredient_emoji: string; quantity: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; listing_id: string; owner_id: string; requester_id: string; ingredient_name: string; ingredient_emoji: string; quantity: string; status?: string; created_at?: string; updated_at?: string };
        Update: { status?: string; updated_at?: string };
        Relationships: [];
      };
      friendships: {
        Row: { id: string; requester_id: string; addressee_id: string; status: string; created_at: string };
        Insert: { id?: string; requester_id: string; addressee_id: string; status?: string; created_at?: string };
        Update: { status?: string };
        Relationships: [];
      };
      share_listings: {
        Row: { id: string; pantry_item_id: string; owner_id: string; status: string; created_at: string };
        Insert: { id?: string; pantry_item_id: string; owner_id: string; status?: string; created_at?: string };
        Update: { status?: string };
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
    Functions: {
      request_share_listing: { Args: { target_listing_id: string }; Returns: string };
      resolve_share_request: { Args: { target_request_id: string; resolution: string }; Returns: boolean };
      close_share_listing: { Args: { target_listing_id: string }; Returns: boolean };
      find_profile_by_handle: {
        Args: { lookup_handle: string };
        Returns: { id: string; handle: string | null; first_name: string | null; last_name: string | null }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
