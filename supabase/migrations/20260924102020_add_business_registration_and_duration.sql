alter table public.businesses
  add column if not exists registration_date date;

alter table public.businesses
  add column if not exists duration_months integer not null default 1;

update public.businesses
set registration_date = coalesce(registration_date, created, current_date)
where registration_date is null;

alter table public.businesses
  drop constraint if exists businesses_duration_months_check;

alter table public.businesses
  add constraint businesses_duration_months_check
  check (duration_months in (1, 3));;
