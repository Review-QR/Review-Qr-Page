alter table public.review_generations
  add column customer_input text check (customer_input is null or length(customer_input) <= 600);

alter table public.trustit_reviews
  add constraint trustit_reviews_id_business_key unique (id, business_id);

create table public.merchant_notifications (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  type text not null check (type = 'customer_review'),
  title text not null check (length(title) <= 100),
  preview text not null check (length(preview) <= 180),
  rating smallint not null check (rating between 1 and 5),
  review_id uuid not null unique,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint merchant_notifications_review_business_key unique (review_id, business_id),
  constraint merchant_notifications_review_business_fkey
    foreign key (review_id, business_id) references public.trustit_reviews(id, business_id) on delete cascade
);
create index merchant_notifications_business_unread_idx
  on public.merchant_notifications (business_id, is_read, created_at desc);
alter table public.merchant_notifications enable row level security;
revoke all on public.merchant_notifications from public, anon, authenticated;
grant select, update (is_read) on public.merchant_notifications to authenticated;
grant select, insert, update, delete on public.merchant_notifications to service_role;
create policy merchant_notifications_select_own on public.merchant_notifications
  for select to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_notifications.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));
create policy merchant_notifications_update_own on public.merchant_notifications
  for update to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_notifications.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  )) with check (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = merchant_notifications.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

create function public.create_merchant_review_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.merchant_notifications (business_id, type, title, preview, rating, review_id)
  values (new.business_id, 'customer_review', 'New Customer Review',
    left(regexp_replace(new.review_text, '[[:space:]]+', ' ', 'g'), 180), new.rating, new.id)
  on conflict (review_id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_merchant_review_notification() from public, anon, authenticated;
create trigger trustit_review_merchant_notification
  after insert on public.trustit_reviews
  for each row when (new.status = 'submitted')
  execute function public.create_merchant_review_notification();

create table public.merchant_messages (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  category text not null check (category in ('Festival','Offer','Announcement','New Product','Customer Appreciation','Seasonal')),
  template_id text not null,
  title text not null check (length(btrim(title)) between 1 and 120),
  message text not null check (length(btrim(message)) between 1 and 2000),
  cta_text text check (cta_text is null or length(cta_text) <= 80),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or ends_at > starts_at),
  check (not ((title || ' ' || message || ' ' || coalesce(cta_text, '')) ~* '\m(google[[:space:]]+)?review\M|\mratings?\M|\mstars?\M|\mpositive feedback\M'
    and (title || ' ' || message || ' ' || coalesce(cta_text, '')) ~* 'discount|offer|reward|free|gift|coupon|cashback|[0-9]{1,3}[[:space:]]*%[[:space:]]*off'))
);
create index merchant_messages_business_updated_idx on public.merchant_messages (business_id, updated_at desc);
alter table public.merchant_messages enable row level security;
revoke all on public.merchant_messages from public, anon, authenticated;
grant select, insert, update, delete on public.merchant_messages to authenticated;
grant select, insert, update, delete on public.merchant_messages to service_role;
create policy merchant_messages_select_own on public.merchant_messages for select to authenticated
  using (exists (select 1 from public.merchant_accounts ma join public.businesses b on b.id=ma.business_id
    where ma.business_id=merchant_messages.business_id and ma.user_id=(select auth.uid()) and b.merchant_status='active'));
create policy merchant_messages_insert_own on public.merchant_messages for insert to authenticated
  with check (exists (select 1 from public.merchant_accounts ma join public.businesses b on b.id=ma.business_id
    where ma.business_id=merchant_messages.business_id and ma.user_id=(select auth.uid()) and b.merchant_status='active'));
create policy merchant_messages_update_own on public.merchant_messages for update to authenticated
  using (exists (select 1 from public.merchant_accounts ma join public.businesses b on b.id=ma.business_id
    where ma.business_id=merchant_messages.business_id and ma.user_id=(select auth.uid()) and b.merchant_status='active'))
  with check (exists (select 1 from public.merchant_accounts ma join public.businesses b on b.id=ma.business_id
    where ma.business_id=merchant_messages.business_id and ma.user_id=(select auth.uid()) and b.merchant_status='active'));
create policy merchant_messages_delete_own on public.merchant_messages for delete to authenticated
  using (exists (select 1 from public.merchant_accounts ma join public.businesses b on b.id=ma.business_id
    where ma.business_id=merchant_messages.business_id and ma.user_id=(select auth.uid()) and b.merchant_status='active'));
