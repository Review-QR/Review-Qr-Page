-- Keep the existing onboarding ownership/session guards while accepting the
-- canonical business catalog and an optional Google Review link.
create or replace function public.create_trustit_business_for_onboarding(
  p_user_id uuid,
  p_name text,
  p_type text,
  p_address text,
  p_review_link text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.merchant_profiles%rowtype;
  v_session public.onboarding_sessions%rowtype;
  v_business_id text;
  v_attempt integer;
begin
  if p_user_id is null
    or p_name is null or length(btrim(p_name)) not between 1 and 160
    or p_type is null or length(btrim(p_type)) not between 1 and 120
    or p_address is null or length(btrim(p_address)) > 1000
    or (p_review_link is not null and (
      length(p_review_link) > 2048
      or lower(p_review_link) not like 'https://%'
      or p_review_link ~* '^https://[^/]*@'
    )) then
    raise exception 'Invalid business details';
  end if;

  select * into v_profile from public.merchant_profiles where user_id = p_user_id;
  if not found then raise exception 'Verified profile required'; end if;

  select * into v_session
    from public.onboarding_sessions
    where user_id = p_user_id
      and status = 'in_progress'
      and current_step = 'business'
      and expires_at > pg_catalog.now()
    order by created_at desc
    limit 1
    for update;
  if not found then raise exception 'Registration session expired'; end if;
  if v_session.business_id is not null then return v_session.business_id; end if;

  for v_attempt in 1..8 loop
    v_business_id := 'QR-' || (10000000 + floor(pg_catalog.random() * 90000000)::bigint)::text;
    if not exists (select 1 from public.businesses where id = v_business_id) then
      insert into public.businesses (
        id, name, owner, phone, type, address, review_link,
        plan, status, expiry, scans, qr_status, qr_type,
        registration_date, merchant_status
      ) values (
        v_business_id, btrim(p_name), v_profile.full_name, v_profile.mobile,
        btrim(p_type), btrim(p_address), nullif(btrim(p_review_link), ''),
        'Basic', 'pending', null, 0, 'disabled', 'review',
        (pg_catalog.now() at time zone 'UTC')::date, 'pending'
      );

      update public.onboarding_sessions
        set business_id = v_business_id,
            current_step = 'plan',
            updated_at = pg_catalog.now()
        where id = v_session.id;
      return v_business_id;
    end if;
  end loop;

  raise exception 'Unable to allocate business identifier';
end;
$$;
