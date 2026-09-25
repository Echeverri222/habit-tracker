-- Habit Tower schema. The app talks to these tables only from the server with
-- the secret key, so RLS is enabled with no policies: anon/public keys get nothing.

create table public.habits (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 40),
  color      text not null default '#ffd35a',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  habit_id   uuid not null references public.habits (id) on delete cascade,
  day        date not null,
  created_at timestamptz not null default now(),
  primary key (habit_id, day)
);

create index habit_logs_day_idx on public.habit_logs (day);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
