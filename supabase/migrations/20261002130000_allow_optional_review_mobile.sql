-- Keep Trustit review personal details optional, including mobile number.
create or replace function public.submit_trustit_review(
  p_business_id text,
  p_review_session_id uuid,
  p_review_text text,
  p_customer_name text,
  p_customer_mobile text,
  p_share_details boolean,
  p_family_members jsonb,
  p_occasions jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business record;
  v_session public.review_sessions%rowtype;
  v_generation public.review_generations%rowtype;
  v_review_id uuid;
  v_profile_id uuid;
  v_family_ids uuid[] := array[]::uuid[];
  v_member jsonb;
  v_occasion jsonb;
  v_family_id uuid;
  v_family_index integer;
  v_relation text;
  v_name text;
  v_mobile text;
  v_month integer;
  v_day integer;
  v_key text;
  v_max_day integer;
begin
  if p_business_id is null or pg_catalog.length(p_business_id) not between 1 and 128
    or pg_catalog.btrim(p_business_id) <> p_business_id
    or p_review_session_id is null
    or p_review_text is null or pg_catalog.length(pg_catalog.btrim(p_review_text)) not between 1 and 10000
    or p_customer_name is null or pg_catalog.length(pg_catalog.btrim(p_customer_name)) not between 1 and 160
    or (p_customer_mobile is not null and (pg_catalog.length(pg_catalog.btrim(p_customer_mobile)) not between 7 and 32
      or pg_catalog.btrim(p_customer_mobile) !~ '^[+0-9(). -]{7,32}$'))
    or p_share_details is null
    or p_family_members is null or pg_catalog.jsonb_typeof(p_family_members) <> 'array'
    or p_occasions is null or pg_catalog.jsonb_typeof(p_occasions) <> 'array'
    or pg_catalog.jsonb_array_length(p_family_members) > 8
    or pg_catalog.jsonb_array_length(p_occasions) > 18
    or (not p_share_details and (p_customer_mobile is not null
      or pg_catalog.jsonb_array_length(p_family_members) <> 0
      or pg_catalog.jsonb_array_length(p_occasions) <> 0)) then
    raise exception 'Invalid Trustit review submission';
  end if;

  select * into v_business
    from public.get_trustit_review_business(p_business_id);
  if not found or v_business.id <> p_business_id
    or v_business.status <> 'active'
    or v_business.merchant_status <> 'active'
    or v_business.qr_status <> 'active'
    or (v_business.expiry is not null and v_business.expiry < (pg_catalog.now() at time zone 'UTC')::date) then
    raise exception 'Business is unavailable';
  end if;

  select * into v_session
    from public.review_sessions as session
    where session.id = p_review_session_id
      and session.business_id = p_business_id
    for update;
  if not found or v_session.selected_rating not between 1 and 5
    or v_session.expires_at is null or v_session.expires_at <= pg_catalog.now()
    or v_session.review_status <> 'draft_ready'
    or v_session.current_generation_number < 1 then
    raise exception 'Review session is unavailable';
  end if;

  select * into v_generation
    from public.review_generations as generation
    where generation.review_session_id = p_review_session_id
      and generation.business_id = p_business_id
      and generation.generation_number = v_session.current_generation_number;
  if not found or v_generation.generation_status <> 'generated'
    or v_generation.generated_text is null
    or pg_catalog.length(pg_catalog.btrim(v_generation.generated_text)) not between 1 and 10000 then
    raise exception 'Generated review is unavailable';
  end if;

  select review.id into v_review_id
    from public.trustit_reviews as review
    where review.review_session_id = p_review_session_id;
  if found then
    if v_session.trustit_status = 'submitted' then return v_review_id; end if;
    raise exception 'Review has already been submitted';
  end if;

  for v_member in select value from pg_catalog.jsonb_array_elements(p_family_members)
  loop
    if pg_catalog.jsonb_typeof(v_member) <> 'object'
      or pg_catalog.length(pg_catalog.btrim(coalesce(v_member->>'name', ''))) not between 1 and 160
      or coalesce(v_member->>'relation', '') not in ('mother','father','husband','wife','brother','sister','son','daughter')
      or (v_member ? 'mobile' and nullif(pg_catalog.btrim(v_member->>'mobile'), '') is not null
        and (pg_catalog.length(pg_catalog.btrim(v_member->>'mobile')) not between 7 and 32
          or (pg_catalog.btrim(v_member->>'mobile')) !~ '^[+0-9(). -]{7,32}$')) then
      raise exception 'Invalid family member';
    end if;
  end loop;

  for v_occasion in select value from pg_catalog.jsonb_array_elements(p_occasions)
  loop
    if pg_catalog.jsonb_typeof(v_occasion) <> 'object'
      or coalesce(v_occasion->>'owner', '') not in ('customer','family')
      or coalesce(v_occasion->>'occasion', '') not in ('birthday','anniversary')
      or v_occasion->>'month' is null or (v_occasion->>'month') !~ '^[0-9]{1,2}$'
      or v_occasion->>'day' is null or (v_occasion->>'day') !~ '^[0-9]{1,2}$' then
      raise exception 'Invalid special occasion';
    end if;
    v_month := (v_occasion->>'month')::integer;
    v_day := (v_occasion->>'day')::integer;
    if v_month not between 1 and 12 then raise exception 'Invalid special occasion'; end if;
    v_max_day := case v_month when 2 then 29 when 4 then 30 when 6 then 30
      when 9 then 30 when 11 then 30 else 31 end;
    if v_day not between 1 and v_max_day then raise exception 'Invalid special occasion'; end if;
    if v_occasion->>'owner' = 'family' then
      if (v_occasion->>'familyIndex') !~ '^(0|[1-7])$'
        or (v_occasion->>'familyIndex')::integer >= pg_catalog.jsonb_array_length(p_family_members) then
        raise exception 'Invalid family occasion owner';
      end if;
    elsif v_occasion ? 'familyIndex' then
      raise exception 'Invalid customer occasion owner';
    end if;
  end loop;

  insert into public.trustit_reviews (
    review_session_id, business_id, rating, review_text, customer_name,
    customer_mobile, status
  ) values (
    p_review_session_id, p_business_id, v_session.selected_rating,
    p_review_text, pg_catalog.btrim(p_customer_name),
    case when p_share_details then pg_catalog.btrim(p_customer_mobile) else null end,
    'submitted'
  ) returning id into v_review_id;

  if p_share_details then
    insert into public.review_customer_profiles (business_id, review_session_id)
    values (p_business_id, p_review_session_id)
    returning id into v_profile_id;

    for v_member in select value from pg_catalog.jsonb_array_elements(p_family_members)
    loop
      v_name := pg_catalog.btrim(v_member->>'name');
      v_relation := v_member->>'relation';
      v_mobile := nullif(pg_catalog.btrim(v_member->>'mobile'), '');
      insert into public.review_family_members (business_id, customer_profile_id, relationship, name, mobile)
      values (p_business_id, v_profile_id, v_relation, v_name, v_mobile)
      returning id into v_family_id;
      v_family_ids := pg_catalog.array_append(v_family_ids, v_family_id);
    end loop;

    for v_occasion in select value from pg_catalog.jsonb_array_elements(p_occasions)
    loop
      v_key := v_occasion->>'occasion';
      v_month := (v_occasion->>'month')::integer;
      v_day := (v_occasion->>'day')::integer;
      if v_occasion->>'owner' = 'customer' then
        insert into public.review_special_occasions (
          business_id, customer_profile_id, occasion_key, month, day
        ) values (p_business_id, v_profile_id, v_key, v_month, v_day);
      else
        v_family_index := (v_occasion->>'familyIndex')::integer;
        insert into public.review_special_occasions (
          business_id, family_member_id, occasion_key, month, day
        ) values (p_business_id, v_family_ids[v_family_index + 1], v_key, v_month, v_day);
      end if;
    end loop;
  end if;

  update public.review_sessions
    set current_review_text = p_review_text,
        trustit_status = 'submitted',
        review_status = 'submitted',
        updated_at = pg_catalog.now()
    where id = p_review_session_id and business_id = p_business_id;

  return v_review_id;
end;
$$;

revoke all on function public.submit_trustit_review(text, uuid, text, text, text, boolean, jsonb, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.submit_trustit_review(text, uuid, text, text, text, boolean, jsonb, jsonb)
  to service_role;
