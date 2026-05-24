create extension if not exists pgcrypto;

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (couple_id, user_id),
  unique (user_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  payer_member_id uuid not null references public.members(id),
  payer_label text,
  date date not null,
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  note text default '',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.expense_splits (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  share_ratio numeric(8, 4) not null default 1,
  primary key (expense_id, member_id)
);

create index if not exists members_user_id_idx on public.members(user_id);
create index if not exists members_couple_id_idx on public.members(couple_id);
create index if not exists expenses_couple_date_idx on public.expenses(couple_id, date desc);
create index if not exists expense_splits_member_id_idx on public.expense_splits(member_id);

alter table public.expenses
add column if not exists payer_label text;

alter table public.couples enable row level security;
alter table public.members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.members
    where members.couple_id = target_couple_id
      and members.user_id = auth.uid()
  );
$$;

create or replace function public.is_expense_couple_member(target_expense_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.expenses
    where expenses.id = target_expense_id
      and public.is_couple_member(expenses.couple_id)
  );
$$;

drop policy if exists "members can read their couple" on public.couples;
create policy "members can read their couple"
on public.couples for select
using (public.is_couple_member(couples.id));

drop policy if exists "members can read couple members" on public.members;
create policy "members can read couple members"
on public.members for select
using (public.is_couple_member(members.couple_id));

drop policy if exists "members can read couple expenses" on public.expenses;
create policy "members can read couple expenses"
on public.expenses for select
using (public.is_couple_member(expenses.couple_id));

drop policy if exists "members can create couple expenses" on public.expenses;
create policy "members can create couple expenses"
on public.expenses for insert
with check (
  created_by = auth.uid()
  and public.is_couple_member(expenses.couple_id)
  and exists (
    select 1 from public.members payer
    where payer.id = expenses.payer_member_id
      and payer.couple_id = expenses.couple_id
  )
);

drop policy if exists "members can delete couple expenses" on public.expenses;
create policy "members can delete couple expenses"
on public.expenses for delete
using (public.is_couple_member(expenses.couple_id));

drop policy if exists "members can update couple expenses" on public.expenses;
create policy "members can update couple expenses"
on public.expenses for update
using (public.is_couple_member(expenses.couple_id))
with check (
  public.is_couple_member(expenses.couple_id)
  and exists (
    select 1 from public.members payer
    where payer.id = expenses.payer_member_id
      and payer.couple_id = expenses.couple_id
  )
);

drop policy if exists "members can read couple splits" on public.expense_splits;
create policy "members can read couple splits"
on public.expense_splits for select
using (public.is_expense_couple_member(expense_splits.expense_id));

drop policy if exists "members can create couple splits" on public.expense_splits;
create policy "members can create couple splits"
on public.expense_splits for insert
with check (
  exists (
    select 1
    from public.expenses
    join public.members viewer on viewer.couple_id = expenses.couple_id
    join public.members split_member on split_member.couple_id = expenses.couple_id
    where expenses.id = expense_splits.expense_id
      and split_member.id = expense_splits.member_id
      and viewer.user_id = auth.uid()
  )
);

drop policy if exists "members can delete couple splits" on public.expense_splits;
create policy "members can delete couple splits"
on public.expense_splits for delete
using (public.is_expense_couple_member(expense_splits.expense_id));

-- After both of you have signed in once, run this setup block with the two
-- auth.users IDs from Supabase Auth > Users. Replace the emails and names.
--
-- insert into public.couples (name)
-- values ('Our Ledger')
-- returning id;
--
-- insert into public.members (couple_id, user_id, display_name)
-- values
--   ('PASTE_COUPLE_ID', 'PASTE_YOUR_AUTH_USER_ID', '我'),
--   ('PASTE_COUPLE_ID', 'PASTE_GIRLFRIEND_AUTH_USER_ID', '女友');
