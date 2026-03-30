import type { Database } from '@/supabase_types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Question = Tables<'questions'>
export type Answer = Tables<'answers'>
export type Source = Tables<'sources'>
export type SourceQuestion = Tables<'sources_questions'>

export type Session = Tables<'sessions'>

