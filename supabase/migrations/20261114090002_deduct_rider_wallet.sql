-- Migration: 20261114090002_deduct_rider_wallet.sql
-- Phase 1: Atomic, overdraw-safe rider wallet deduction.
--
-- Closes the read-modify-write race in the old client-side
--   read wallet_balance -> write (balance - amount)
-- which under concurrency could double-deduct or drive the wallet negative.
--
-- The deduction is a single conditional UPDATE ... RETURNING inside a
-- plpgsql function (security definer, search_path pinned) so it is atomic at
-- the row level and only proceeds when the balance can cover the amount.
-- No separate read is ever trusted.
--
-- Behaviour:
--   * amount must be > 0 and finite (rejected otherwise).
--   * If the rider does not exist or balance < amount => returns
--     'ok' = false, 'code' in ('not_found','insufficient'). No row changed.
--   * Otherwise the balance is decremented atomically and 'ok' = true,
--     'new_balance' is returned.
--
-- Rollback:
--   drop function if exists public.deduct_rider_wallet(uuid, numeric);

create or replace function public.deduct_rider_wallet(p_rider uuid, p_amount numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance numeric;
begin
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('ok', false, 'code', 'invalid_amount');
  end if;

  update public.delivery_riders
     set wallet_balance = wallet_balance - p_amount,
         updated_at     = now()
   where id = p_rider
     and wallet_balance >= p_amount
  returning wallet_balance into v_new_balance;

  if not found then
    -- Either rider missing or insufficient funds; report which.
    if exists (select 1 from public.delivery_riders where id = p_rider) then
      return jsonb_build_object('ok', false, 'code', 'insufficient');
    end if;
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;

  return jsonb_build_object('ok', true, 'new_balance', v_new_balance);
end;
$$;

revoke execute on function public.deduct_rider_wallet(uuid, numeric) from anon, authenticated, public;
grant execute on function public.deduct_rider_wallet(uuid, numeric) to service_role;
