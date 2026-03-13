-- Migration: Add installments support to expenses table
-- Allows tracking credit card purchases paid in fixed monthly installments

ALTER TABLE public.expenses
    ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS installments_paid INTEGER NOT NULL DEFAULT 0;

-- installments: total number of installments (NULL = not an installment purchase)
-- installments_paid: how many installments have been paid so far (starts at 0)

-- Add a check constraint: installments must be >= 2 if set
ALTER TABLE public.expenses
    ADD CONSTRAINT chk_installments_min
    CHECK (installments IS NULL OR installments >= 2);

-- Add a check constraint: installments_paid cannot exceed total installments
ALTER TABLE public.expenses
    ADD CONSTRAINT chk_installments_paid_max
    CHECK (installments IS NULL OR installments_paid <= installments);

COMMENT ON COLUMN public.expenses.installments IS 'Total number of monthly installments (NULL = not a credit installment purchase)';
COMMENT ON COLUMN public.expenses.installments_paid IS 'Number of installments paid so far. Starts at 0 (first payment pending).';
