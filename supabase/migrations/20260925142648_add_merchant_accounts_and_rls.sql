create table public.merchant_accounts (
  business_id text primary key references public.businesses (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.merchant_accounts enable row level security;
grant select on public.merchant_accounts to authenticated;
grant select on public.merchant_accounts to service_role;

create policy merchant_accounts_select_own
  on public.merchant_accounts for select to authenticated
  using (user_id = (select auth.uid()));

create policy businesses_select_linked_active_merchant
  on public.businesses for select to authenticated
  using (
    merchant_status = 'active'
    and exists (
      select 1 from public.merchant_accounts as merchant
      where merchant.business_id = businesses.id
        and merchant.user_id = (select auth.uid())
    )
  );

create or replace function public.provision_merchant_account(p_business_id text, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_business_id is null or p_user_id is null then
    raise exception 'Business and user are required';
  end if;

  if not exists (
    select 1 from public.businesses as business
    where business.id = p_business_id
      and business.merchant_status = 'pending'
      and nullif(btrim(business.owner), '') is not null
      and nullif(btrim(business.phone), '') is not null
  ) then
    raise exception 'Business is not eligible for merchant activation';
  end if;

  insert into public.merchant_accounts (business_id, user_id)
  values (p_business_id, p_user_id);

  update public.businesses set merchant_status = 'active'
  where id = p_business_id and merchant_status = 'pending';

  if not found then
    raise exception 'Business is not eligible for merchant activation';
  end if;
end;
$$;

revoke all on function public.provision_merchant_account(text, uuid) from public, anon, authenticated;
grant execute on function public.provision_merchant_account(text, uuid) to service_role;
