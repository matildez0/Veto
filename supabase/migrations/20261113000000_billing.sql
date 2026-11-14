create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('mensal', 'anual')),
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.linked_accounts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  google_account_id text,
  email text not null,
  created_at timestamptz not null default now(),
  unique (user_id, email)
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.linked_accounts enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
drop policy if exists "Users can read their subscription" on public.subscriptions;
drop policy if exists "Users can read their linked accounts" on public.linked_accounts;
drop policy if exists "Users can add their linked accounts" on public.linked_accounts;

create policy "Users can read their profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can read their subscription"
  on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can read their linked accounts"
  on public.linked_accounts for select using (auth.uid() = user_id);
create policy "Users can add their linked accounts"
  on public.linked_accounts for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.count_linked_accounts()
returns integer
language sql
security invoker
as $$
  select count(*)::integer from public.linked_accounts where user_id = auth.uid();
$$;
