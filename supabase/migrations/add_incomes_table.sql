-- =====================================================
-- Income Module Migration
-- Run this in Supabase SQL Editor to add income support
-- =====================================================

-- 1. Create Incomes table
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'CLP',

  source text not null,           -- Ej: "Sueldo", "Freelance", "Bono"
  is_recurring boolean not null default false,
  frequency text check (frequency in ('weekly','monthly','yearly')),

  income_date date not null,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Performance indexes
create index if not exists idx_incomes_user_date 
on public.incomes(user_id, income_date desc);

create index if not exists idx_incomes_user_source 
on public.incomes(user_id, source);

-- 3. Enable RLS
alter table public.incomes enable row level security;

-- 4. RLS Policy for incomes (users can only access their own data)
create policy "incomes_crud_own"
on public.incomes for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- 5. Trigger for updated_at
drop trigger if exists trg_incomes_updated_at on public.incomes;
create trigger trg_incomes_updated_at
before update on public.incomes
for each row execute function public.set_updated_at();

-- =====================================================
-- La tabla de ingresos está lista!
-- Ahora puedes registrar tu sueldo y otros ingresos 💰
-- =====================================================
