-- Seed business-specific experience categories for Trustit's customer review flow.
-- Configuration remains database-driven so future business types/categories can be added
-- without changing the customer UI.

insert into public.review_experience_categories
  (business_type, category_key, display_label, display_order, is_enabled)
values
  ('Salon', 'service_quality', 'Service Quality', 10, true),
  ('Salon', 'staff_behavior', 'Staff Behavior', 20, true),
  ('Salon', 'hair_styling', 'Hair & Styling', 30, true),
  ('Salon', 'cleanliness', 'Cleanliness', 40, true),
  ('Salon', 'ambience', 'Ambience', 50, true),
  ('Salon', 'value', 'Value for Money', 60, true),

  ('Medical', 'consultation', 'Doctor / Consultation', 10, true),
  ('Medical', 'staff_behavior', 'Staff Behavior', 20, true),
  ('Medical', 'waiting_time', 'Waiting Time', 30, true),
  ('Medical', 'cleanliness', 'Cleanliness', 40, true),
  ('Medical', 'service_quality', 'Service Quality', 50, true),
  ('Medical', 'value', 'Value for Money', 60, true),

  ('Garage', 'service_quality', 'Service Quality', 10, true),
  ('Garage', 'repair_quality', 'Repair Quality', 20, true),
  ('Garage', 'staff_behavior', 'Staff Behavior', 30, true),
  ('Garage', 'service_time', 'Service Time', 40, true),
  ('Garage', 'cleanliness', 'Cleanliness', 50, true),
  ('Garage', 'value', 'Value for Money', 60, true),

  ('Library', 'book_collection', 'Book Collection', 10, true),
  ('Library', 'staff_behavior', 'Staff Behavior', 20, true),
  ('Library', 'availability', 'Availability', 30, true),
  ('Library', 'environment', 'Reading Environment', 40, true),
  ('Library', 'cleanliness', 'Cleanliness', 50, true),
  ('Library', 'value', 'Value for Money', 60, true),

  ('Shop', 'product_quality', 'Product Quality', 10, true),
  ('Shop', 'variety', 'Variety', 20, true),
  ('Shop', 'service_quality', 'Service Quality', 30, true),
  ('Shop', 'staff_behavior', 'Staff Behavior', 40, true),
  ('Shop', 'cleanliness', 'Cleanliness', 50, true),
  ('Shop', 'value', 'Value for Money', 60, true),

  ('Cafe/Restaurant', 'food_quality', 'Food Quality', 10, true),
  ('Cafe/Restaurant', 'taste', 'Taste', 20, true),
  ('Cafe/Restaurant', 'service_quality', 'Service Quality', 30, true),
  ('Cafe/Restaurant', 'ambience', 'Ambience', 40, true),
  ('Cafe/Restaurant', 'cleanliness', 'Cleanliness', 50, true),
  ('Cafe/Restaurant', 'value', 'Value for Money', 60, true),

  ('Restaurant', 'food_quality', 'Food Quality', 10, true),
  ('Restaurant', 'taste', 'Taste', 20, true),
  ('Restaurant', 'service_quality', 'Service Quality', 30, true),
  ('Restaurant', 'ambience', 'Ambience', 40, true),
  ('Restaurant', 'cleanliness', 'Cleanliness', 50, true),
  ('Restaurant', 'value', 'Value for Money', 60, true),

  ('Manufacturer', 'product_quality', 'Product Quality', 10, true),
  ('Manufacturer', 'service_quality', 'Service Quality', 20, true),
  ('Manufacturer', 'delivery', 'Delivery', 30, true),
  ('Manufacturer', 'communication', 'Communication', 40, true),
  ('Manufacturer', 'staff_behavior', 'Staff Behavior', 50, true),
  ('Manufacturer', 'value', 'Value for Money', 60, true)
on conflict (business_type, category_key) do update
set display_label = excluded.display_label,
    display_order = excluded.display_order,
    is_enabled = excluded.is_enabled,
    updated_at = pg_catalog.now();;
