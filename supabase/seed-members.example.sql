-- Run this after both users have signed in once.
-- Replace all PASTE_* values with real IDs from Supabase.

insert into public.couples (name)
values ('Our Ledger')
returning id;

-- Copy the returned couple id, then run:
insert into public.members (couple_id, user_id, display_name)
values
  ('PASTE_COUPLE_ID', 'PASTE_YOUR_AUTH_USER_ID', '我'),
  ('PASTE_COUPLE_ID', 'PASTE_GIRLFRIEND_AUTH_USER_ID', '女友');
