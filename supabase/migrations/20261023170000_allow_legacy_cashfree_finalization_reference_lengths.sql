-- Align finalization RPC order reference validation with apply_verified_cashfree_payment.
-- This changes validation only; no payment or subscription data is modified.
do $migration$
declare
  v_function_definition text;
  v_updated_definition text;
begin
  select pg_get_functiondef(
    'public.finalize_trustit_one_time_payment(text,text,text,numeric,text,timestamptz)'::regprocedure
  ) into v_function_definition;

  v_updated_definition := replace(v_function_definition, '''^rqr_[a-f0-9]{32}$''', '''^rqr_[a-f0-9]{32,34}$''');

  if v_updated_definition = v_function_definition then
    if v_function_definition like '%{32,34}%' then
      raise notice 'Payment reference validation already supports 32 to 34 hexadecimal characters.';
    else
      raise exception 'Expected validation pattern not found; no change applied.';
    end if;
  else
    execute v_updated_definition;
  end if;
end
$migration$;
