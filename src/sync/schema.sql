-- Supabase 云同步所需的数据表与权限（在 Supabase 控制台的 SQL Editor 里执行一次）
-- 每个用户只保存一条 JSON 文档（整份 AppData），last-write-wins。

create table if not exists app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

drop policy if exists "own_row" on app_state;
create policy "own_row" on app_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
