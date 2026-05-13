export type Module = 'knesset' | 'government'

export interface WatchlistItem {
  id: string
  user_id: string
  module: Module
  type: string
  target_id: string
  target_label: string
  created_at: string
}

export interface WatchlistRule {
  id: string
  watchlist_item_id: string
  event_types: string[]
  channels: string[]
  frequency: 'immediate' | 'daily' | 'weekly'
  filter_level: 'everything' | 'major' | 'new_only'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  created_at: string
}

export interface ChatSource {
  id: string
  source_table: string
  source_id: string
  content_text: string
  similarity: number
  url?: string
}

export interface User {
  id: string
  email?: string
  user_metadata?: { full_name?: string; avatar_url?: string }
}
