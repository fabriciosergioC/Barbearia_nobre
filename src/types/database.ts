export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'gerente' | 'recepcionista' | 'barbeiro'
export type MemberStatus = 'ativo' | 'inativo'

export interface Database {
  public: {
    Tables: {
      establishments: {
        Row: {
          id: string
          name: string
          slug: string
          phone: string | null
          email: string | null
          document: string | null
          address: Json | null
          timezone: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          phone?: string | null
          email?: string | null
          document?: string | null
          address?: Json | null
          timezone?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          phone?: string | null
          email?: string | null
          document?: string | null
          address?: Json | null
          timezone?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          establishment_id: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: AppRole
          status: MemberStatus
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          establishment_id: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: AppRole
          status?: MemberStatus
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: AppRole
          status?: MemberStatus
          last_seen_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_establishment_id_fkey'
            columns: ['establishment_id']
            isOneRelation: true
            referencedRelation: 'establishments'
            referencedColumns: ['id']
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          module: string
          description: string
          created_at: string
        }
        Insert: {
          code: string
          module: string
          description: string
          created_at?: string
        }
        Update: {
          module?: string
          description?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          role: AppRole
          permission_code: string
          created_at: string
        }
        Insert: {
          role: AppRole
          permission_code: string
          created_at?: string
        }
        Update: {
          permission_code?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: number
          establishment_id: string | null
          actor_id: string | null
          action: string
          entity: string
          entity_id: string | null
          before: Json | null
          after: Json | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          establishment_id?: string | null
          actor_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          before?: Json | null
          after?: Json | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      my_context: {
        Args: Record<string, never>
        Returns: Json
      }
      bootstrap_establishment: {
        Args: {
          p_establishment_name: string
          p_slug: string
          p_full_name: string
          p_phone?: string | null
        }
        Returns: Json
      }
      has_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
      member_status: MemberStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
