-- Fence each provider attempt and serialize claims on the owning review session.
alter table public.review_generations
  add column generation_claim_token uuid;

-- Requested rows created before this claim protocol have no active owner.
-- Make them retryable instead of treating them as an in-flight claim.
update public.review_generations
set generation_status = 'failed',
    generated_text = null
where generation_status = 'requested';

alter table public.review_generations
  add constraint review_generations_claim_token_check
  check (
    (generation_status = 'requested' and generation_claim_token is not null)
    or (generation_status in ('generated', 'failed') and generation_claim_token is null)
  );

create or replace function public.claim_review_generation(
  p_business_id text,
  p_review_session_id uuid,
  p_generation_number integer,
  p_rating_context smallint,
  p_experience_context jsonb
)
returns table (
  claimed boolean,
  generation_status text,
  generated_text text,
  claim_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_rating smallint;
  v_generation public.review_generations%rowtype;
  v_claim_token uuid;
begin
  if p_business_id is null
    or pg_catalog.length(p_business_id) < 1
    or pg_catalog.length(p_business_id) > 128
    or pg_catalog.btrim(p_business_id) <> p_business_id
    or p_review_session_id is null
    or p_generation_number is null
    or p_generation_number < 1
    or p_rating_context is null
    or p_rating_context < 1
    or p_rating_context > 5
    or p_experience_context is null
    or pg_catalog.jsonb_typeof(p_experience_context) <> 'array'
    or pg_catalog.jsonb_array_length(p_experience_context) < 1
    or pg_catalog.jsonb_array_length(p_experience_context) > 10 then
    raise exception 'Invalid review generation claim';
  end if;

  -- Serializing by session makes the no-row-yet case just as atomic as retries.
  select session.selected_rating
    into v_session_rating
    from public.review_sessions as session
    where session.id = p_review_session_id
      and session.business_id = p_business_id
      and session.expires_at > pg_catalog.now()
    for update;

  if not found or v_session_rating is distinct from p_rating_context then
    raise exception 'Review session is unavailable';
  end if;

  select generation.*
    into v_generation
    from public.review_generations as generation
    where generation.review_session_id = p_review_session_id
      and generation.generation_number = p_generation_number
    for update;

  if found then
    if v_generation.business_id <> p_business_id then
      raise exception 'Review generation business does not match session';
    end if;

    if v_generation.generation_status in ('generated', 'requested') then
      return query
        select false, v_generation.generation_status,
          v_generation.generated_text, null::uuid;
      return;
    end if;

    v_claim_token := pg_catalog.gen_random_uuid();
    update public.review_generations as generation
      set generation_status = 'requested',
          generated_text = null,
          generation_claim_token = v_claim_token
      where generation.id = v_generation.id
      returning * into v_generation;
  else
    v_claim_token := pg_catalog.gen_random_uuid();
    insert into public.review_generations (
      review_session_id,
      business_id,
      generation_number,
      rating_context,
      experience_context,
      generation_status,
      generated_text,
      generation_claim_token
    ) values (
      p_review_session_id,
      p_business_id,
      p_generation_number,
      p_rating_context,
      p_experience_context,
      'requested',
      null,
      v_claim_token
    )
    returning * into v_generation;
  end if;

  return query
    select true, v_generation.generation_status,
      v_generation.generated_text, v_generation.generation_claim_token;
end;
$$;

create or replace function public.finish_review_generation(
  p_business_id text,
  p_review_session_id uuid,
  p_generation_number integer,
  p_claim_token uuid,
  p_generated_text text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if p_business_id is null
    or p_review_session_id is null
    or p_generation_number is null
    or p_claim_token is null then
    return null;
  end if;

  update public.review_generations as generation
    set generation_status = case
          when p_generated_text is not null
            and pg_catalog.length(pg_catalog.btrim(p_generated_text)) between 1 and 10000
            then 'generated'
          else 'failed'
        end,
        generated_text = case
          when p_generated_text is not null
            and pg_catalog.length(pg_catalog.btrim(p_generated_text)) between 1 and 10000
            then p_generated_text
          else null
        end,
        generation_claim_token = null
    where generation.business_id = p_business_id
      and generation.review_session_id = p_review_session_id
      and generation.generation_number = p_generation_number
      and generation.generation_status = 'requested'
      and generation.generation_claim_token = p_claim_token
    returning generation.generation_status into v_status;

  return v_status;
end;
$$;

revoke all on function public.claim_review_generation(text, uuid, integer, smallint, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.claim_review_generation(text, uuid, integer, smallint, jsonb)
  to service_role;

revoke all on function public.finish_review_generation(text, uuid, integer, uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.finish_review_generation(text, uuid, integer, uuid, text)
  to service_role;
