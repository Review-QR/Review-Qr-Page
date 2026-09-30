insert into public.review_experience_categories (
  business_type,
  category_key,
  display_label,
  display_order,
  is_enabled
)
values
  ('Salon', 'service_quality', 'Service Quality', 1, true),
  ('Salon', 'staff_behavior', 'Staff Behavior', 2, true),
  ('Salon', 'hair_styling', 'Hair & Styling', 3, true),
  ('Salon', 'cleanliness', 'Cleanliness', 4, true),
  ('Salon', 'ambience', 'Ambience', 5, true),
  ('Salon', 'value', 'Value for Money', 6, true),

  ('Medical', 'consultation', 'Doctor / Consultation', 1, true),
  ('Medical', 'staff_behavior', 'Staff Behavior', 2, true),
  ('Medical', 'waiting_time', 'Waiting Time', 3, true),
  ('Medical', 'cleanliness', 'Cleanliness', 4, true),
  ('Medical', 'service_quality', 'Service Quality', 5, true),
  ('Medical', 'value', 'Value for Money', 6, true),

  ('Garage', 'service_quality', 'Service Quality', 1, true),
  ('Garage', 'repair_quality', 'Repair Quality', 2, true),
  ('Garage', 'staff_behavior', 'Staff Behavior', 3, true),
  ('Garage', 'service_time', 'Service Time', 4, true),
  ('Garage', 'cleanliness', 'Cleanliness', 5, true),
  ('Garage', 'value', 'Value for Money', 6, true),

  ('Library', 'book_collection', 'Book Collection', 1, true),
  ('Library', 'staff_behavior', 'Staff Behavior', 2, true),
  ('Library', 'availability', 'Availability', 3, true),
  ('Library', 'environment', 'Reading Environment', 4, true),
  ('Library', 'cleanliness', 'Cleanliness', 5, true),
  ('Library', 'value', 'Value for Money', 6, true),

  ('Shop', 'product_quality', 'Product Quality', 1, true),
  ('Shop', 'variety', 'Variety', 2, true),
  ('Shop', 'service_quality', 'Service Quality', 3, true),
  ('Shop', 'staff_behavior', 'Staff Behavior', 4, true),
  ('Shop', 'cleanliness', 'Cleanliness', 5, true),
  ('Shop', 'value', 'Value for Money', 6, true),

  ('Cafe/Restaurant', 'food_quality', 'Food Quality', 1, true),
  ('Cafe/Restaurant', 'taste', 'Taste', 2, true),
  ('Cafe/Restaurant', 'service_quality', 'Service Quality', 3, true),
  ('Cafe/Restaurant', 'ambience', 'Ambience', 4, true),
  ('Cafe/Restaurant', 'cleanliness', 'Cleanliness', 5, true),
  ('Cafe/Restaurant', 'value', 'Value for Money', 6, true),

  ('Restaurant', 'food_quality', 'Food Quality', 1, true),
  ('Restaurant', 'taste', 'Taste', 2, true),
  ('Restaurant', 'service_quality', 'Service Quality', 3, true),
  ('Restaurant', 'ambience', 'Ambience', 4, true),
  ('Restaurant', 'cleanliness', 'Cleanliness', 5, true),
  ('Restaurant', 'value', 'Value for Money', 6, true),

  ('Manufacturer', 'product_quality', 'Product Quality', 1, true),
  ('Manufacturer', 'service_quality', 'Service Quality', 2, true),
  ('Manufacturer', 'delivery', 'Delivery', 3, true),
  ('Manufacturer', 'communication', 'Communication', 4, true),
  ('Manufacturer', 'staff_behavior', 'Staff Behavior', 5, true),
  ('Manufacturer', 'value', 'Value for Money', 6, true)
on conflict (business_type, category_key) do update
set display_label = excluded.display_label,
    display_order = excluded.display_order,
    is_enabled = excluded.is_enabled,
    updated_at = pg_catalog.now();

-- Save a session's first experience selection as one atomic, retry-safe set.
create or replace function public.save_review_session_experiences(
  p_business_id text,
  p_review_session_id uuid,
  p_category_keys text[]
)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category_keys text[];
  v_existing_keys text[];
  v_available_keys text[];
  v_business_type text;
  v_selected_rating smallint;
begin
  if p_business_id is null
    or pg_catalog.length(p_business_id) < 1
    or pg_catalog.length(p_business_id) > 128
    or pg_catalog.btrim(p_business_id) <> p_business_id
    or p_review_session_id is null
    or p_category_keys is null
    or pg_catalog.cardinality(p_category_keys) < 1
    or pg_catalog.cardinality(p_category_keys) > 100
    or pg_catalog.array_position(p_category_keys, null) is not null then
    raise exception 'Invalid experience selection';
  end if;

  select pg_catalog.array_agg(distinct selected.category_key order by selected.category_key)
    into v_category_keys
    from pg_catalog.unnest(p_category_keys) as selected(category_key);

  if pg_catalog.cardinality(v_category_keys) < 1
    or pg_catalog.cardinality(v_category_keys) > 10
    or exists (
      select 1
      from pg_catalog.unnest(v_category_keys) as selected(category_key)
      where selected.category_key !~ '^[a-z][a-z0-9_]{0,63}$'
    ) then
    raise exception 'Invalid experience selection';
  end if;

  -- Serialize concurrent retries for this session. The row lock below also
  -- keeps its rating/session state stable during this transaction.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_review_session_id::text, 0)
  );

  select session.selected_rating
    into v_selected_rating
    from public.review_sessions as session
    where session.id = p_review_session_id
      and session.business_id = p_business_id
      and session.expires_at > pg_catalog.now()
    for update;

  if not found or v_selected_rating is null then
    raise exception 'Review session is unavailable';
  end if;

  select pg_catalog.array_agg(experience.category_key order by experience.category_key)
    into v_existing_keys
    from public.review_session_experiences as experience
    where experience.review_session_id = p_review_session_id
      and experience.business_id = p_business_id;

  if v_existing_keys is not null then
    if v_existing_keys = v_category_keys then
      return v_existing_keys;
    end if;
    raise exception 'Experience selection is already saved';
  end if;

  select case business.type
      when 'Clinic' then 'Medical'
      else business.type
    end
    into v_business_type
    from public.businesses as business
    where business.id = p_business_id;

  if v_business_type is null then
    raise exception 'Business is unavailable';
  end if;

  select coalesce(
      pg_catalog.array_agg(category.category_key order by category.category_key),
      array[]::text[]
    )
    into v_available_keys
    from public.review_experience_categories as category
    where category.business_type = v_business_type
      and category.is_enabled
      and category.category_key = any(v_category_keys);

  if v_available_keys is distinct from v_category_keys then
    raise exception 'Experience selection is unavailable';
  end if;

  insert into public.review_session_experiences (
    review_session_id,
    business_id,
    category_key,
    category_label_snapshot
  )
  select
    p_review_session_id,
    p_business_id,
    category.category_key,
    category.display_label
  from public.review_experience_categories as category
  where category.business_type = v_business_type
    and category.is_enabled
    and category.category_key = any(v_category_keys);

  return v_category_keys;
end;
$$;

revoke all on function public.save_review_session_experiences(text, uuid, text[])
  from public, anon, authenticated, service_role;
grant execute on function public.save_review_session_experiences(text, uuid, text[])
  to service_role;
