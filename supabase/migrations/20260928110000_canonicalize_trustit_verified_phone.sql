create or replace function public.complete_trustit_profile(
  p_user_id uuid,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mobile text;
  v_phone_input text;
  v_phone_compact text;
  v_verified_at timestamptz;
  v_session_id uuid;
  v_in_parentheses boolean := false;
  v_parentheses_have_digit boolean := false;
  v_character text;
  v_index integer;
begin
  if p_user_id is null or p_full_name is null or length(btrim(p_full_name)) not between 1 and 160 then
    raise exception 'Invalid registration profile';
  end if;

  select auth_user.phone, auth_user.phone_confirmed_at
    into v_phone_input, v_verified_at
    from auth.users as auth_user
    where auth_user.id = p_user_id;

  if not found or v_phone_input is null or v_verified_at is null then
    raise exception 'Verified phone required';
  end if;

  if char_length(v_phone_input) > 32 then
    raise exception 'Verified phone required';
  end if;

  v_phone_input := btrim(v_phone_input);
  if v_phone_input = '' or v_phone_input !~ '^[0-9+()[:space:]-]+$' then
    raise exception 'Verified phone required';
  end if;

  -- Match the application's accepted separators while rejecting malformed or
  -- nested parentheses before removing formatting characters.
  for v_index in 1..char_length(v_phone_input) loop
    v_character := substr(v_phone_input, v_index, 1);
    if v_character = '(' then
      if v_in_parentheses then
        raise exception 'Verified phone required';
      end if;
      v_in_parentheses := true;
      v_parentheses_have_digit := false;
    elsif v_character = ')' then
      if not v_in_parentheses or not v_parentheses_have_digit then
        raise exception 'Verified phone required';
      end if;
      v_in_parentheses := false;
    elsif v_in_parentheses and v_character ~ '^[0-9]$' then
      v_parentheses_have_digit := true;
    end if;
  end loop;

  if v_in_parentheses then
    raise exception 'Verified phone required';
  end if;

  v_phone_compact := regexp_replace(v_phone_input, '[()[:space:]-]', '', 'g');

  if v_phone_compact ~ '^\+[1-9][0-9]{7,14}$' then
    -- Indian numbers use the same mobile-number constraint as the application.
    if substr(v_phone_compact, 1, 3) = '+91'
      and v_phone_compact !~ '^\+91[6-9][0-9]{9}$' then
      raise exception 'Verified phone required';
    end if;
    v_mobile := v_phone_compact;
  elsif v_phone_compact ~ '^[6-9][0-9]{9}$' then
    v_mobile := '+91' || v_phone_compact;
  elsif v_phone_compact ~ '^91[6-9][0-9]{9}$' then
    v_mobile := '+' || v_phone_compact;
  else
    raise exception 'Verified phone required';
  end if;

  if v_mobile !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Verified phone required';
  end if;

  if exists (
    select 1 from public.merchant_accounts as merchant
    where merchant.user_id = p_user_id
  ) then
    raise exception 'Merchant account already exists';
  end if;

  insert into public.merchant_profiles (user_id, mobile, full_name, mobile_verified_at)
  values (p_user_id, v_mobile, btrim(p_full_name), v_verified_at)
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        updated_at = pg_catalog.now()
    where public.merchant_profiles.mobile = excluded.mobile;

  if not found then
    raise exception 'Mobile is already registered';
  end if;

  select session.id into v_session_id
    from public.onboarding_sessions as session
    where session.user_id = p_user_id
      and session.status in ('in_progress', 'payment_pending')
      and (session.expires_at > pg_catalog.now()
        or (session.status = 'payment_pending' and session.payment_reference is not null))
    order by session.created_at desc
    limit 1
    for update;

  if v_session_id is null then
    update public.onboarding_sessions
      set status = 'expired', updated_at = pg_catalog.now()
      where user_id = p_user_id
        and status = 'in_progress'
        and expires_at <= pg_catalog.now();
    insert into public.onboarding_sessions (user_id, mobile)
    values (p_user_id, v_mobile)
    returning id into v_session_id;
  end if;

  return v_session_id;
end;
$$;

revoke all on function public.complete_trustit_profile(uuid, text) from public, anon, authenticated;
grant execute on function public.complete_trustit_profile(uuid, text) to service_role;
