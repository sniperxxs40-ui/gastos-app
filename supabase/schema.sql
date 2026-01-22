-- =====================================================
-- Control de Gastos Personales - Database Schema
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- =====================================================
-- 2. Profiles table (links to auth.users)
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  default_currency text not null default 'CLP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_currency on public.profiles(default_currency);

-- =====================================================
-- 3. Categories table (per user)
-- =====================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text, -- hex optional: '#22c55e'
  icon text,  -- optional: 'shopping-cart'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_categories_user_name unique (user_id, name)
);

create index if not exists idx_categories_user_id on public.categories(user_id);

-- =====================================================
-- 4. Payment Methods table (per user)
-- =====================================================
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, -- 'Efectivo', 'Débito', 'Crédito', etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_payment_methods_user_name unique (user_id, name)
);

create index if not exists idx_payment_methods_user_id on public.payment_methods(user_id);

-- =====================================================
-- 5. Expenses table (core)
-- =====================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'CLP',

  expense_date date not null,         -- expense date
  description text,                   -- free note
  merchant text,                      -- optional merchant

  category_id uuid references public.categories(id) on delete set null,
  payment_method_id uuid references public.payment_methods(id) on delete set null,

  is_recurring boolean not null default false,
  recurring_frequency text check (recurring_frequency in ('weekly','monthly','yearly')),

  -- For recurring: store start and next occurrence (simple and useful)
  recurring_start_date date,
  next_occurrence_date date,
  recurring_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance indexes
create index if not exists idx_expenses_user_date on public.expenses(user_id, expense_date desc);
create index if not exists idx_expenses_user_category on public.expenses(user_id, category_id);
create index if not exists idx_expenses_user_payment_method on public.expenses(user_id, payment_method_id);

-- Text search (optional, for description search)
create index if not exists idx_expenses_description_trgm
on public.expenses using gin (description gin_trgm_ops);

-- =====================================================
-- 6. Trigger function for updated_at
-- =====================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for each table
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_payment_methods_updated_at on public.payment_methods;
create trigger trg_payment_methods_updated_at
before update on public.payment_methods
for each row execute function public.set_updated_at();

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

-- =====================================================
-- 7. Enable Row Level Security (RLS)
-- =====================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.payment_methods enable row level security;
alter table public.expenses enable row level security;

-- =====================================================
-- 8. RLS Policies
-- =====================================================

-- PROFILES
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- CATEGORIES
create policy "categories_crud_own"
on public.categories for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- PAYMENT METHODS
create policy "payment_methods_crud_own"
on public.payment_methods for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- EXPENSES
create policy "expenses_crud_own"
on public.expenses for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- =====================================================
-- 9. Function to handle new user signup
-- Creates profile and default categories/payment methods
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile for new user
  insert into public.profiles (id, full_name, default_currency)
  values (new.id, new.raw_user_meta_data->>'full_name', 'CLP');
  
  -- Create default categories
  insert into public.categories (user_id, name, color, icon) values
    (new.id, 'Alimentación', '#22c55e', 'utensils'),
    (new.id, 'Transporte', '#3b82f6', 'car'),
    (new.id, 'Arriendo', '#f59e0b', 'home'),
    (new.id, 'Salud', '#ef4444', 'heart'),
    (new.id, 'Ocio', '#8b5cf6', 'gamepad-2'),
    (new.id, 'Suscripciones', '#ec4899', 'credit-card'),
    (new.id, 'Educación', '#06b6d4', 'graduation-cap'),
    (new.id, 'Servicios', '#f97316', 'zap'),
    (new.id, 'Otros', '#6b7280', 'more-horizontal');
  
  -- Create default payment methods
  insert into public.payment_methods (user_id, name) values
    (new.id, 'Efectivo'),
    (new.id, 'Débito'),
    (new.id, 'Crédito'),
    (new.id, 'Transferencia');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================
-- 10. Incomes table (for salary and additional income)
-- =====================================================
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

-- Performance indexes for incomes
create index if not exists idx_incomes_user_date 
on public.incomes(user_id, income_date desc);

create index if not exists idx_incomes_user_source 
on public.incomes(user_id, source);

-- Enable RLS for incomes
alter table public.incomes enable row level security;

-- RLS Policy for incomes
create policy "incomes_crud_own"
on public.incomes for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Trigger for updated_at on incomes
drop trigger if exists trg_incomes_updated_at on public.incomes;
create trigger trg_incomes_updated_at
before update on public.incomes
for each row execute function public.set_updated_at();
