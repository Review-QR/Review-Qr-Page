revoke execute on function public.get_business_for_qr(text) from public;
revoke execute on function public.get_business_for_qr(text) from authenticated;
revoke execute on function public.increment_business_scan(text) from public;
revoke execute on function public.increment_business_scan(text) from authenticated;
grant execute on function public.get_business_for_qr(text) to anon;
grant execute on function public.increment_business_scan(text) to anon;
