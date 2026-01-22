-- =====================================================
-- Budget Feature Migration - Add is_primary to incomes
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add is_primary column to incomes table
ALTER TABLE public.incomes ADD COLUMN IF NOT EXISTS is_primary boolean default false;

-- 2. Index for fast lookup of primary income
CREATE INDEX IF NOT EXISTS idx_incomes_user_primary 
ON public.incomes(user_id, is_primary) WHERE is_primary = true;

-- =====================================================
-- Campo is_primary añadido para el presupuesto mensual 💰
-- =====================================================
