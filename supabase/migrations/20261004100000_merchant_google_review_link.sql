create or replace function public.set_merchant_google_review_link(p_review_link text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id text;
  v_link text;
begin
  if p_review_link is null or pg_catalog.btrim(p_review_link) = '' then
    v_link := null;
  else
    v_link := pg_catalog.btrim(p_review_link);
    if pg_catalog.length(v_link) > 2048
      or v_link ~ '[[:space:][:cntrl:]]'
      or v_link !~* '^https://([a-z0-9-]+\.)*google\.com(/|$)'
        and v_link !~* '^https://g\.page(/|$)'
        and v_link !~* '^https://maps\.app\.goo\.gl(/|$)' then
      raise exception 'Invalid Google review URL';
    end if;
  end if;

  select account.business_id into v_business_id
  from public.merchant_accounts as account
  join public.businesses as business on business.id = account.business_id
  where account.user_id = (select auth.uid())
    and business.merchant_status = 'active'
    and business.deleted_at is null
  for update of business;

  if not found then
    raise exception 'Active merchant business required';
  end if;

  update public.businesses
  set review_link = v_link
  where id = v_business_id
    and merchant_status = 'active'
    and deleted_at is null;

  return v_link;
end;
$$;

revoke all on function public.set_merchant_google_review_link(text)
  from public, anon, service_role;
grant execute on function public.set_merchant_google_review_link(text)
  to authenticated;
