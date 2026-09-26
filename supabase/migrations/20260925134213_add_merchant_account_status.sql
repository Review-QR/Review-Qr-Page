alter table public.businesses
  add column merchant_status text not null default 'pending';

alter table public.businesses
  alter column registration_date set default current_date,
  alter column registration_date set not null;
