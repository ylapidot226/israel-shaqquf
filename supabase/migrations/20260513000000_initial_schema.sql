-- Enable pgvector extension
create extension if not exists vector;

-- ========================================
-- KNESSET TABLES
-- ========================================

create table if not exists factions (
  faction_id integer primary key,
  name text not null,
  knesset_num integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists persons (
  person_id integer primary key,
  name text not null,
  gender_id integer,
  is_current boolean default false,
  faction_id integer references factions(faction_id),
  photo_url text,
  last_updated_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists bills (
  bill_id integer primary key,
  name text not null,
  status_id integer,
  status_desc text,
  initiator_person_id integer references persons(person_id),
  knesset_num integer,
  last_updated_date timestamptz,
  sub_type_id integer,
  sub_type_desc text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists committees (
  committee_id integer primary key,
  name text not null,
  knesset_num integer,
  created_at timestamptz default now()
);

create table if not exists committee_sessions (
  session_id integer primary key,
  committee_id integer references committees(committee_id),
  start_date timestamptz,
  status_id integer,
  status_desc text,
  name text,
  broadcast_url text,
  last_updated_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists agenda_items (
  agenda_id integer primary key,
  name text not null,
  status_id integer,
  status_desc text,
  person_id integer references persons(person_id),
  date timestamptz,
  last_updated_date timestamptz,
  created_at timestamptz default now()
);

-- Sync metadata
create table if not exists sync_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  last_sync_at timestamptz not null,
  records_updated integer default 0,
  created_at timestamptz default now()
);
create unique index if not exists sync_log_table_name_idx on sync_log(table_name);

-- ========================================
-- GOVERNMENT TABLES
-- ========================================

create table if not exists ministries (
  ministry_id text primary key,
  name text not null,
  hebrew_name text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists ministers (
  minister_id uuid primary key default gen_random_uuid(),
  name text not null,
  ministry_id text references ministries(ministry_id),
  start_date date,
  end_date date,
  government_num integer,
  is_current boolean default false,
  created_at timestamptz default now()
);

create table if not exists gov_decisions (
  decision_id uuid primary key default gen_random_uuid(),
  gov_num integer,
  decision_num text,
  title text not null,
  date date,
  ministry_id text references ministries(ministry_id),
  ministry_name text,
  summary text,
  content text,
  url text,
  tags text[],
  last_updated_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists gov_decisions_date_idx on gov_decisions(date desc);
create index if not exists gov_decisions_gov_num_idx on gov_decisions(gov_num);
create index if not exists gov_decisions_ministry_idx on gov_decisions(ministry_id);

-- ========================================
-- SHARED / EMBEDDINGS
-- ========================================

create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id text not null,
  content_text text not null,
  embedding vector(1536),
  created_at timestamptz default now(),
  unique(source_table, source_id)
);

create index if not exists embeddings_vector_idx on embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ========================================
-- AUTH & USER TABLES
-- ========================================

create table if not exists watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module text not null check (module in ('knesset','government')),
  type text not null,
  target_id text not null,
  target_label text not null,
  created_at timestamptz default now(),
  unique(user_id, module, type, target_id)
);

create index if not exists watchlist_items_user_idx on watchlist_items(user_id);

create table if not exists watchlist_rules (
  id uuid primary key default gen_random_uuid(),
  watchlist_item_id uuid references watchlist_items(id) on delete cascade not null,
  event_types text[] default array['new_item'],
  channels text[] default array['email'],
  frequency text default 'immediate' check (frequency in ('immediate','daily','weekly')),
  filter_level text default 'everything' check (filter_level in ('everything','major','new_only')),
  created_at timestamptz default now()
);

create table if not exists notifications_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  watchlist_item_id uuid references watchlist_items(id) on delete set null,
  content text not null,
  sent_at timestamptz default now(),
  channel text not null,
  read boolean default false
);

create index if not exists notifications_log_user_idx on notifications_log(user_id, sent_at desc);

create table if not exists ai_chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  question text not null,
  answer text not null,
  sources jsonb default '[]',
  created_at timestamptz default now()
);

create index if not exists ai_chat_history_user_idx on ai_chat_history(user_id, created_at desc);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

alter table watchlist_items enable row level security;
alter table watchlist_rules enable row level security;
alter table notifications_log enable row level security;
alter table ai_chat_history enable row level security;

create policy "Users manage own watchlist"
  on watchlist_items for all using (auth.uid() = user_id);

create policy "Users manage own watchlist rules"
  on watchlist_rules for all using (
    watchlist_item_id in (
      select id from watchlist_items where user_id = auth.uid()
    )
  );

create policy "Users read own notifications"
  on notifications_log for select using (auth.uid() = user_id);

create policy "Users read own chat history"
  on ai_chat_history for all using (auth.uid() = user_id);

-- Public read on knesset/gov data
alter table persons enable row level security;
alter table bills enable row level security;
alter table factions enable row level security;
alter table committees enable row level security;
alter table committee_sessions enable row level security;
alter table agenda_items enable row level security;
alter table gov_decisions enable row level security;
alter table ministries enable row level security;
alter table ministers enable row level security;
alter table embeddings enable row level security;

create policy "Public read persons" on persons for select using (true);
create policy "Public read bills" on bills for select using (true);
create policy "Public read factions" on factions for select using (true);
create policy "Public read committees" on committees for select using (true);
create policy "Public read committee_sessions" on committee_sessions for select using (true);
create policy "Public read agenda_items" on agenda_items for select using (true);
create policy "Public read gov_decisions" on gov_decisions for select using (true);
create policy "Public read ministries" on ministries for select using (true);
create policy "Public read ministers" on ministers for select using (true);
create policy "Public read embeddings" on embeddings for select using (true);

-- ========================================
-- VECTOR SEARCH FUNCTION
-- ========================================

create or replace function match_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 10
)
returns table (
  id uuid,
  source_table text,
  source_id text,
  content_text text,
  similarity float
)
language sql stable
as $$
  select
    e.id,
    e.source_table,
    e.source_id,
    e.content_text,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings e
  where 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
